// API data types
export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: "pet_owner" | "doctor" | "staff"
  created_at: string
}

export type Pet = {
  id: string
  owner_id: string
  name: string
  type: string
  breed?: string
  date_of_birth?: string
  gender: string
  created_at: string
}

export type Appointment = {
  id: string
  pet_id: string
  doctor_id: string
  appointment_date: string
  description?: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  created_at: string
}

export type AppointmentDetails = {
  id: string
  appointment_id: string
  diagnosis?: string
  treatment?: string
  notes?: string
  created_at: string
}

// Fallback users data (used when API is not available)
export const fallbackUsers: User[] = [
  {
    id: "user-1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+1234567890",
    role: "pet_owner",
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    phone: "+1234567891",
    role: "pet_owner",
    created_at: "2023-01-02T00:00:00Z",
  },
  {
    id: "doctor-1",
    email: "testdoctor@example.com",
    first_name: "Test",
    last_name: "Doctor",
    phone: "+1234567892",
    role: "doctor",
    created_at: "2023-01-03T00:00:00Z",
  },
  {
    id: "doctor-2",
    email: "dr.johnson@example.com",
    first_name: "Emily",
    last_name: "Johnson",
    phone: "+1234567893",
    role: "doctor",
    created_at: "2023-01-04T00:00:00Z",
  },
  {
    id: "staff-1",
    email: "staff@example.com",
    first_name: "Sarah",
    last_name: "Wilson",
    phone: "+1234567894",
    role: "staff",
    created_at: "2023-01-05T00:00:00Z",
  },
]

// Fallback pets data (used when API is not available)
export const fallbackPets: Pet[] = [
  {
    id: "pet-1",
    owner_id: "user-1",
    name: "Buddy",
    type: "dog",
    breed: "Golden Retriever",
    date_of_birth: "2020-05-15",
    gender: "male",
    created_at: "2023-01-10T00:00:00Z",
  },
  {
    id: "pet-2",
    owner_id: "user-1",
    name: "Whiskers",
    type: "cat",
    breed: "Persian",
    date_of_birth: "2021-03-20",
    gender: "female",
    created_at: "2023-01-11T00:00:00Z",
  },
  {
    id: "pet-3",
    owner_id: "user-2",
    name: "Charlie",
    type: "dog",
    breed: "Labrador",
    date_of_birth: "2019-08-10",
    gender: "male",
    created_at: "2023-01-12T00:00:00Z",
  },
]

// Fallback appointments data (used when API is not available)
export const fallbackAppointments: Appointment[] = [
  {
    id: "appointment-1",
    pet_id: "pet-1",
    doctor_id: "doctor-1",
    appointment_date: "2024-01-15T10:00:00Z",
    description: "Regular checkup",
    status: "scheduled",
    created_at: "2023-12-01T00:00:00Z",
  },
  {
    id: "appointment-2",
    pet_id: "pet-2",
    doctor_id: "doctor-2",
    appointment_date: "2024-01-16T14:30:00Z",
    description: "Vaccination",
    status: "scheduled",
    created_at: "2023-12-02T00:00:00Z",
  },
  {
    id: "appointment-3",
    pet_id: "pet-3",
    doctor_id: "doctor-1",
    appointment_date: "2023-12-20T09:00:00Z",
    description: "Skin condition",
    status: "completed",
    created_at: "2023-12-15T00:00:00Z",
  },
]

// Fallback appointment details data (used when API is not available)
export const fallbackAppointmentDetails: AppointmentDetails[] = [
  {
    id: "details-1",
    appointment_id: "appointment-3",
    diagnosis: "Mild dermatitis",
    treatment: "Topical cream and dietary changes",
    notes: "Follow up in 2 weeks",
    created_at: "2023-12-20T09:30:00Z",
  },
]

// Authentication state
let currentUser: User | null = null

// API client
export const apiClient = {
  // Authentication
  signIn: async (email: string, password: string) => {
    try {
      // Call the real API endpoint
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store the token
      localStorage.setItem("authToken", data.token);
      
      // Update local state
      currentUser = data.user;
      localStorage.setItem("mockUser", JSON.stringify(data.user));
      
      return { user: data.user, session: { user: data.user } };
    } catch (error) {
      // Fallback to mock implementation if API is not available
      console.warn('API call failed, using fallback implementation:', error);
      
      const user = fallbackUsers.find((u) => u.email === email);
      if (!user) {
        throw new Error("Invalid login credentials");
      }
      
      // For demo purposes, accept any password
      currentUser = user;
      localStorage.setItem("mockUser", JSON.stringify(user));
      
      return { user, session: { user } };
    }
  },

  signUp: async (email: string, password: string, firstName: string, lastName: string, phone: string, role: string = "pet_owner") => {
    try {
      // Call the real API endpoint
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          phone,
          role
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Update local state
      const newUser: User = {
        id: data.user.id || `user-${Date.now()}`,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        created_at: data.user.created_at || new Date().toISOString(),
      };
      
      fallbackUsers.push(newUser);
      currentUser = newUser;
      localStorage.setItem("mockUser", JSON.stringify(newUser));
      
      return { user: newUser };
    } catch (error) {
      // Fallback to mock implementation if API is not available
      console.warn('API call failed, using fallback implementation:', error);
      
      // Check if user already exists
      if (fallbackUsers.find((u) => u.email === email)) {
        throw new Error("User already exists");
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
        created_at: new Date().toISOString(),
      };

      fallbackUsers.push(newUser);
      currentUser = newUser;
      localStorage.setItem("mockUser", JSON.stringify(newUser));

      return { user: newUser };
    }
  },

  signOut: async () => {
    try {
      // Remove token and user data
      localStorage.removeItem("authToken")
      localStorage.removeItem("mockUser")
      currentUser = null
      
      // Force page reload to clear any cached state
      window.location.href = "/"
    } catch (error) {
      console.error("Error during sign out:", error)
      // Basic cleanup even if there's an error
      localStorage.removeItem("authToken")
      localStorage.removeItem("mockUser")
      currentUser = null
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        // No token found, check for stored user
        if (currentUser) return currentUser;
        
        const stored = localStorage.getItem("mockUser");
        if (stored) {
          currentUser = JSON.parse(stored);
          return currentUser;
        }
        
        return null;
      }
      
      // Call the real API endpoint
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Token might be invalid, clear it
        localStorage.removeItem("authToken");
        return null;
      }
      
      const userData = await response.json();
      
      // Update local state
      currentUser = userData;
      localStorage.setItem("mockUser", JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      // Fallback to stored user if API is not available
      console.warn('API call failed, using stored user:', error);
      
      if (currentUser) return currentUser;
      
      const stored = localStorage.getItem("mockUser");
      if (stored) {
        currentUser = JSON.parse(stored);
        return currentUser;
      }
      
      return null;
    }
  },

  // Users
  getUsers: async (filters?: { role?: string }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = 'http://localhost:5001/api/users';
      if (filters?.role) {
        url += `?role=${filters.role}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      let users = [...fallbackUsers];
      if (filters?.role) {
        users = users.filter((u) => u.role === filters.role);
      }
      
      return users;
    }
  },
  
  getUser: async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const user = fallbackUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      return user;
    }
  },

  // Pets
  getPets: async (ownerId?: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = 'http://localhost:5001/api/pets';
      if (ownerId) {
        url += `?owner_id=${ownerId}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch pets");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      let pets = [...fallbackPets];
      if (ownerId) {
        pets = pets.filter((p) => p.owner_id === ownerId);
      }
      
      return pets.map((pet) => ({
        ...pet,
        owner: fallbackUsers.find((u) => u.id === pet.owner_id),
      }));
    }
  },
  
  getPet: async (petId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/pets/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch pet");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const pet = fallbackPets.find(p => p.id === petId);
      if (!pet) {
        throw new Error("Pet not found");
      }
      
      return {
        ...pet,
        owner: fallbackUsers.find((u) => u.id === pet.owner_id),
      };
    }
  },

  createPet: async (petData: Omit<Pet, "id" | "created_at">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('http://localhost:5001/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(petData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create pet");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const newPet: Pet = {
        ...petData,
        id: `pet-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      
      fallbackPets.push(newPet);
      return newPet;
    }
  },
  
  updatePet: async (petId: string, updates: Partial<Pet>) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update pet");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const index = fallbackPets.findIndex(p => p.id === petId);
      if (index === -1) {
        throw new Error("Pet not found");
      }
      
      fallbackPets[index] = { ...fallbackPets[index], ...updates };
      return fallbackPets[index];
    }
  },

  deletePet: async (petId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete pet");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const index = fallbackPets.findIndex((p) => p.id === petId);
      if (index > -1) {
        fallbackPets.splice(index, 1);
      }
    }
  },

  // Appointments
  getAppointments: async (filters?: { petIds?: string[]; doctorId?: string }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = 'http://localhost:5001/api/appointments';
      const queryParams = [];
      
      if (filters?.doctorId) {
        queryParams.push(`doctor_id=${filters.doctorId}`);
      }
      
      console.log('filters',filters)
      if (filters?.petIds && filters.petIds.length > 0) {
        queryParams.push(`pet_ids=${filters.petIds.join(',')}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      let appointments = [...fallbackAppointments];

      if (filters?.petIds) {
        appointments = appointments.filter((a) => filters.petIds!.includes(a.pet_id));
      }

      if (filters?.doctorId) {
        appointments = appointments.filter((a) => a.doctor_id === filters.doctorId);
      }

      return appointments.map((appointment) => ({
        ...appointment,
        pet: {
          ...fallbackPets.find((p) => p.id === appointment.pet_id)!,
          owner: fallbackUsers.find((u) => u.id === fallbackPets.find((p) => p.id === appointment.pet_id)?.owner_id),
        },
        doctor: fallbackUsers.find((u) => u.id === appointment.doctor_id),
      }));
    }
  },

  getAppointment: async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointment");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const appointment = fallbackAppointments.find((a) => a.id === appointmentId);
      if (!appointment) return null;

      const pet = fallbackPets.find((p) => p.id === appointment.pet_id)!;
      const owner = fallbackUsers.find((u) => u.id === pet.owner_id)!;
      const doctor = fallbackUsers.find((u) => u.id === appointment.doctor_id)!;
      const details = fallbackAppointmentDetails.find((d) => d.appointment_id === appointmentId);

      return {
        ...appointment,
        pet: {
          ...pet,
          owner,
        },
        doctor,
        details,
      };
    }
  },

  createAppointment: async (appointmentData: Omit<Appointment, "id" | "created_at">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('http://localhost:5001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const newAppointment: Appointment = {
        ...appointmentData,
        id: `appointment-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      fallbackAppointments.push(newAppointment);
      return newAppointment;
    }
  },

  updateAppointment: async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const index = fallbackAppointments.findIndex((a) => a.id === appointmentId);
      if (index > -1) {
        fallbackAppointments[index] = { ...fallbackAppointments[index], ...updates };
        return fallbackAppointments[index];
      }
      throw new Error("Appointment not found");
    }
  },

  // Appointment Details
  createOrUpdateAppointmentDetails: async (appointmentId: string, detailsData: Omit<AppointmentDetails, "id" | "created_at" | "appointment_id">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`http://localhost:5001/api/appointments/${appointmentId}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(detailsData)
      });
      
      if (!response.ok) {
        throw new Error("Failed to create/update appointment details");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const existingDetailsIndex = fallbackAppointmentDetails.findIndex(
        (d) => d.appointment_id === appointmentId
      );
      
      if (existingDetailsIndex > -1) {
        // Update existing details
        fallbackAppointmentDetails[existingDetailsIndex] = {
          ...fallbackAppointmentDetails[existingDetailsIndex],
          ...detailsData,
        };
        return fallbackAppointmentDetails[existingDetailsIndex];
      } else {
        // Create new details
        const newDetails: AppointmentDetails = {
          ...detailsData,
          appointment_id: appointmentId,
          id: `details-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        
        fallbackAppointmentDetails.push(newDetails);
        return newDetails;
      }
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch('http://localhost:5001/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      
      return await response.json();
    } catch (error) {
      console.warn('API call failed, using fallback implementation:', error);
      
      // Fallback to mock implementation
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      const todayAppointments = fallbackAppointments.filter((a) => {
        const appointmentDate = new Date(a.appointment_date);
        return appointmentDate >= todayStart && appointmentDate < todayEnd;
      });

      return {
        totalAppointments: fallbackAppointments.length,
        todayAppointments: todayAppointments.length,
        totalPets: fallbackPets.length,
        totalOwners: fallbackUsers.filter((u) => u.role === "pet_owner").length,
      };
    }
  },
}