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



// API base URL
const API_BASE_URL = 'http://localhost:5001';

// Authentication state
let currentUser: User | null = null

// API client
export const apiClient = {
  // Authentication
  signIn: async (email: string, password: string) => {
    try {
      // Call the real API endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
      console.error('API call failed:', error);
      throw new Error("Login failed. Please try again later.");
    }
  },

  signUp: async (email: string, password: string, firstName: string, lastName: string, phone: string, role: string = "pet_owner") => {
    try {
      // Call the real API endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
      currentUser = data.user;
      localStorage.setItem("mockUser", JSON.stringify(data.user));
      
      return { user: data.user };
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error("Registration failed. Please try again later.");
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
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
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
      console.error('API call failed:', error);
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
      
      let url = `${API_BASE_URL}/api/users`;
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
      console.error('API call failed:', error);
      throw new Error("Failed to fetch users. Please try again later.");
    }
  },
  
  getUser: async (userId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error("Failed to fetch user. Please try again later.");
    }
  },

  // Pets
  getPets: async (ownerId?: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = `${API_BASE_URL}/api/pets`;
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
      console.error('API call failed:', error);
      throw new Error("Failed to fetch pets. Please try again later.");
    }
  },
  
  getPet: async (petId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch pet");
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error("Failed to fetch pet. Please try again later.");
    }
  },

  createPet: async (petData: Omit<Pet, "id" | "created_at">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/pets`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to create pet. Please try again later.");
    }
  },
  
  updatePet: async (petId: string, updates: Partial<Pet>) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to update pet. Please try again later.");
    }
  },

  deletePet: async (petId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/pets/${petId}`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to delete pet. Please try again later.");
    }
  },

  // Appointments
  getAppointments: async (filters?: { petIds?: string[]; doctorId?: string }) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = `${API_BASE_URL}/api/appointments`;
      const queryParams = [];
      
      if (filters?.doctorId) {
        queryParams.push(`doctor_id=${filters.doctorId}`);
      }
      
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
      console.error('API call failed:', error);
      throw new Error("Failed to fetch appointments. Please try again later.");
    }
  },

  getAppointment: async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch appointment");
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error("Failed to fetch appointment. Please try again later.");
    }
  },

  createAppointment: async (appointmentData: Omit<Appointment, "id" | "created_at">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to create appointment. Please try again later.");
    }
  },

  updateAppointment: async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to update appointment. Please try again later.");
    }
  },

  // Appointment Details
  createOrUpdateAppointmentDetails: async (appointmentId: string, detailsData: Omit<AppointmentDetails, "id" | "created_at" | "appointment_id">) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/details`, {
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
      console.error('API call failed:', error);
      throw new Error("Failed to create/update appointment details. Please try again later.");
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error("Failed to fetch statistics. Please try again later.");
    }
  },
}