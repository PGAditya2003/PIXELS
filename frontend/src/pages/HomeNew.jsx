import React, { useState, useEffect } from "react";
import logo from "/NITlogo.png"
import {
    Flex,
  Box,
  Grid,
  GridItem,
  Button,
  Text,
  Image,
} from "@chakra-ui/react";
import imageCompression from "browser-image-compression";
import { useMediaQuery } from "@chakra-ui/react";

const API_URL = import.meta.env.VITE_API_URL;


const HomeNew = () => {

    const [loading, setLoading] = useState(true);
     const [tileImages, setTileImages] = useState(Array(480).fill(null));
      const [selectedTileIndex, setSelectedTileIndex] = useState(null);
      const [isBelow1080] = useMediaQuery("(max-width: 1080px)");

      const [page, setPage] = useState(1); // current page
      const [allLoaded, setAllLoaded] = useState(false); // stop loading when done


    
      useEffect(() => {
        const fetchImages = async () => {
  if (allLoaded) return;

  try {
    const res = await fetch(`${API_URL}/api/pixels?page=${page}&limit=3`);
    const data = await res.json();

    if (data.length === 0) {
      setAllLoaded(true); // no more data
      return;
    }

    const updatedImages = [...tileImages];
    data.forEach(pixel => {
      updatedImages[pixel.tileIndex] = {
        src: pixel.imageData,
        poster: pixel.user,
        time: new Date(pixel.date).toLocaleString(),
      };
    });

    setTileImages(updatedImages);
    setPage(prev => prev + 1); // load next page on next call
    setLoading(false);
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


//     //   *************PRE-LOADER*********
//       if (loading) {
//   return (
//     <Flex w="100%" h="100vh" align="center" justify="center" bg="gray.900">
//       <Box textAlign="center">
//         {/* <Image src={logo} w="100px" mx="auto" mb={4} /> */}
        
//         <Text fontSize="xl" color="white">Loading Updated Collage...</Text>
//       </Box>
//     </Flex>
//   );
// }

 return (
  <Flex direction="column" align="center" justify="center" w="100%" minH="100vh" bg="gray.800">
        <Flex
            w="90%"
            direction={isBelow1080 ? "column" : "row"}
            align="center"
            justify="center"
            p={4}
            boxShadow="lg"
        >

      {/* ***************** LEFT TITLE ************************ */}
      <Box
        w={{ base: "100%", md: "20%" }}
        p={4}
        display="flex"
        flexDirection="column"
        alignItems={{ base: "center", md: "flex-start" }}
        textAlign={{ base: "center", md: "left" }}
        mb={{ base: 4, md: 0 }}
      >
        <Image src={logo} w="80%" mb={2} />
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          PIXELS BY NIT RAIPUR
        </Text>
        <Text fontSize="lg" as={"div"} >
          <ul>
            <li>Click on a tile to upload an image.</li>
            <li>Click again to view or edit the image.</li>
            <li>Get creative and have fun!</li>
          </ul>
        </Text>
      </Box>

      {/* ***************** CENTER GRID ************************ */}
      <Box
        p={4}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        maxW={{ base: "100%", md: "fit-content" }}
        overflowX="auto"
        mb={{ base: 4, md: 0 }}
        mx={"auto"}
      >
        <Grid
          templateColumns="repeat(24, 1fr)"
          gap={0}
          minW="960px"
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

      {/* ***************** RIGHT PANEL ************************ */}
      {!selectedTile && (
        <Flex
          justify="center"
          align="center"
          minH="40vh"
          minW="20vw"
          border="2px"
          borderColor="white"
          borderStyle="dotted"
          p={4}
          borderRadius="md"
          mx="auto"
          w={{ base: "100%", md: "auto" }}
        >
          <Text fontStyle="italic">Click on a tile to open it here</Text>
        </Flex>
      )}

      {selectedTile && (
        <Box
          p={4}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="lg"
          w={{ base: "100%", md: "20vw" }}
          maxH={{ base: "auto", md: "864px" }}
          overflowY="auto"
          mt={{ base: 4, md: 0 }}
          zIndex={10}
          mx={"auto"}
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
    </Flex>

    {/* NOTE */}
    <Flex>
      <Text fontStyle="italic" mt={4}>
        **Note : Only upload images you are comfortable with sharing.
      </Text>
    </Flex>

    {/* Animation */}
    <Box as="style">
      {`
      @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
      }
      `}
    </Box>
  </Flex>
);


}

export default HomeNew
