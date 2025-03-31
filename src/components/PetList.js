import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
} from "@mui/material";

const PetList = ({ token, pets, setPets }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/pet-owner/pets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch pets.");
        }

        const data = await response.json();
        setPets(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [token]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Your Pets
      </Typography>

      {pets.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          You have not added any pets yet.
        </Typography>
      ) : (
        <List>
          {pets.map((pet) => (
            <Card key={pet._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{pet.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Species: {pet.species}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Breed: {pet.breed}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Age: {pet.age} years
                </Typography>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PetList;
