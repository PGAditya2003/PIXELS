import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Button,
  Text,
  Image,
} from "@chakra-ui/react";
import imageCompression from "browser-image-compression";
const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [tileImages, setTileImages] = useState(Array(480).fill(null));
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/pixels`);
        const data = await res.json();
  
        const updatedImages = [...tileImages];
        data.forEach(pixel => {
          updatedImages[pixel.tileIndex] = {
            src: pixel.imageData,
            poster: pixel.user,
            time: new Date(pixel.date).toLocaleString(),
          };
        });
        setTileImages(updatedImages);
      } catch (err) {
        console.error("Error loading images:", err);
      }
    };
  
    fetchImages(); // initial load
  
    const intervalId = setInterval(fetchImages, 60000); // fetch every 60 seconds
  
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []); // dependency array: only run once on mount
  

  const user = "Anonymous"; // Replace with actual user info later

  const updateTile = async (index) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Image = reader.result;

        const newImages = [...tileImages];
        newImages[index] = {
          src: base64Image,
          poster: "User123", // dummy user
          time: new Date().toLocaleString(),
        };
        setTileImages(newImages);
        setSelectedTileIndex(index);

        try {
          const res = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: "User123",
              tileIndex: index,
              imageData: base64Image,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to update tile");
          }

          const result = await res.json();
          console.log("Upload successful:", result);
        } catch (uploadErr) {
          console.error("Error updating tile:", uploadErr);
        }
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
    }
  };

  input.click();
  };
   
  // Handle tile click
  const handleTileClick = (index) => {
    if (!tileImages[index]) {
      updateTile(index);
    } else {
      setSelectedTileIndex(index);
    }
  };

  const handleEdit = async () => {
    if (selectedTileIndex === null) return;
  
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
  
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
  
      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
  
        reader.onloadend = async () => {
          const updatedTile = {
            user: "User123",  // Your user info here
            imageData: reader.result,  // The base64 encoded image
          };
  
          try {
            const response = await fetch(`${API_URL}/api/pixels/${selectedTileIndex}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatedTile),
            });
  
            if (!response.ok) {
              throw new Error('Failed to update tile');
            }
  
            const data = await response.json();
            console.log('Tile updated:', data);
  
            setTileImages(prevState => {
              const newImages = [...prevState];
              newImages[selectedTileIndex] = {
                src: reader.result,
                poster: "User123",
                time: new Date().toLocaleString(),
              };
              return newImages;
            });
  
            setSelectedTileIndex(null);
          } catch (error) {
            console.error('Error updating tile:', error);
          }
        };
  
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    };
  
    input.click();
  };
  
  const closePanel = () => {
    setSelectedTileIndex(null);
  };

  const selectedTile = selectedTileIndex !== null ? tileImages[selectedTileIndex] : null;

  return (
   // Inside return (
<Box
  display="flex"
  flexDirection={{ base: "column", md: "row" }}
  justifyContent="space-between"
  alignItems={{ base: "stretch", md: "center" }}
  p={4}
  minH="100vh"
  w="100%"
  position="relative"
  bg="gray.900" 
  color="white"   
>
  <Box w="100%">
    <Box textAlign={{ base: "left", md: "center" }} mb={4}>
      <Text fontSize="2xl" fontWeight="bold" mb={2}>
        PIXELS BY NIT RAIPUR
      </Text>
      <Text fontSize="lg">
        Click on a tile to upload an image. Click again to view or edit the image. Get creative and have fun!
        <br />
        Can you paint a picture , One Pixel at a time?
      </Text>
    </Box>


   {/* Grid Box */}
<Box
  p={4}
  borderWidth={1}
  borderRadius="lg"
  boxShadow="lg"
  maxW={{ base: "100%", md: "fit-content" }}
  overflowX="auto"
  mx="auto" // ✅ center the whole box on desktop
>
  <Grid
    templateColumns="repeat(24, 1fr)"
    gap={0}
    minW="960px" // ✅ ensures horizontal scroll on mobile but auto width on desktop
  >
    {Array.from({ length: 480 }).map((_, index) => (
      <GridItem
        key={index}
        w="40px"
        h="36px"
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.800"
        border="1px solid black"
        p={0}
        m={0}
      >
        <Button
          w="100%"
          h="100%"
          p={0}
          m={0}
          bg="gray.800"
          onClick={() => handleTileClick(index)}
          borderRadius={0}
        >
          {tileImages[index] ? (
            <img
              src={tileImages[index].src}
              alt="tile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            "+"
          )}
        </Button>
      </GridItem>
    ))}
  </Grid>
</Box>


    {/* Side Panel */}
    {selectedTile && (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        w={{ base: "100%", md: "300px" }}
        maxH={{ base: "auto", md: "864px" }}
        overflowY="auto"
        mt={{ base: 4, md: 0 }}
        position={{ base: "static", md: "absolute" }}
        top={{ md: "30%" }}
        right={{ md: "10%" }}
        zIndex={10}
        animation="fadeIn 0.9s ease-in-out"
      >
        <Box mb={2} display="flex" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold">
            #{selectedTileIndex}
          </Text>
          <Button size="sm" onClick={closePanel}>
            ❌
          </Button>
        </Box>

        <Image
          src={selectedTile.src}
          alt="Tile"
          mb={4}
          borderRadius="md"
          boxShadow="md"
        />
        <Text>
          <strong>Posted by:</strong> {selectedTile.poster}
        </Text>
        <Text>
          <strong>Time:</strong> {selectedTile.time}
        </Text>

        <Button mt={6} colorScheme="blue" onClick={handleEdit}>
          Edit Image
        </Button>
      </Box>
    )}
  </Box>

  <Box as="style">
    {`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}
  </Box>
</Box>


  );
};

export default Home;
