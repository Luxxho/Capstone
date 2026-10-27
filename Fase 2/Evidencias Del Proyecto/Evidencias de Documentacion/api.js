const API_URL = "http://localhost:8000";



// Registrar usuario nuevo
export async function registerUser(data) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo registrar el usuario");
  }
  return response.json();
}



// Iniciar sesión
export async function loginUser(data) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Credenciales incorrectas");
  }
  return response.json();
}



// Obtener perfil del usuario autenticado
export async function getMe(token) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo cargar el perfil del usuario");
  }
  return response.json();
}



// Actualizar el perfil del usuario autenticado.
// El usuario puede cambiar sus datos personales, pero NO su rol.
export async function updateMe(token, data) {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.detail || "No se pudo actualizar tu perfil"
    );
  }
  return response.json();
}



// Restablecer contraseña
export async function resetPassword(data) {
  const response = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "No se pudo restablecer la contraseña");
  }
  return response.json();
}



// Obtener mascotas del usuario autenticado
export async function getPets(token) {
  const response = await fetch(`${API_URL}/api/pets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las mascotas");
  }
  return response.json();
}



// Obtener razas / variedades por especie
export async function getPetBreeds(token, species) {
  const params = new URLSearchParams({
    species,
  });
  const response = await fetch(
    `${API_URL}/api/pets/breeds/catalog?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail ||
        "No se pudieron cargar las razas o variedades"
    );
  }
  return response.json();
}



// Registrar una nueva raza / variedad
export async function registerPetBreed(
  token,
  species,
  name
) {
  const response = await fetch(
    `${API_URL}/api/pets/breeds/catalog`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        species,
        name,
      }),
    }
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail ||
        "No se pudo registrar la nueva raza o variedad"
    );
  }
  return response.json();
}



// Crear mascota
export async function createPet(token, data) {
  const response = await fetch(`${API_URL}/api/pets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo registrar la mascota");
  }
  return response.json();
}



// Editar mascota
export async function updatePet(token, petId, data) {
  const response = await fetch(`${API_URL}/api/pets/${petId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la mascota");
  }
  return response.json();
}



// Eliminar mascota
export async function deletePet(token, petId) {
  const response = await fetch(`${API_URL}/api/pets/${petId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la mascota");
  }
  return true;
}



// Obtener vacunas de una mascota
export async function getVaccines(token, petId) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/vaccines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las vacunas");
  }
  return response.json();
}



// Crear vacuna para una mascota
export async function createVaccine(token, petId, data) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/vaccines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo registrar la vacuna");
  }
  return response.json();
}



// Editar vacuna del usuario
export async function updateVaccine(token, vaccineId, data) {
  const response = await fetch(`${API_URL}/api/pets/vaccines/${vaccineId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la vacuna");
  }
  return response.json();
}



// Eliminar vacuna del usuario
export async function deleteVaccine(token, vaccineId) {
  const response = await fetch(`${API_URL}/api/pets/vaccines/${vaccineId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la vacuna");
  }
  return true;
}



// Obtener medicamentos de una mascota
export async function getMedications(token, petId) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/medications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar los medicamentos");
  }
  return response.json();
}



// Crear medicamento para una mascota
export async function createMedication(token, petId, data) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/medications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo registrar el medicamento");
  }
  return response.json();
}



// Editar medicamento del usuario
export async function updateMedication(token, medicationId, data) {
  const response = await fetch(`${API_URL}/api/pets/medications/${medicationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar el medicamento");
  }
  return response.json();
}



// Eliminar medicamento del usuario
export async function deleteMedication(token, medicationId) {
  const response = await fetch(`${API_URL}/api/pets/medications/${medicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar el medicamento");
  }
  return true;
}



// Obtener consultas de una mascota
export async function getConsultations(token, petId) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/consultations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las consultas");
  }
  return response.json();
}



// Crear consulta para una mascota
export async function createConsultation(token, petId, data) {
  const response = await fetch(`${API_URL}/api/pets/${petId}/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo registrar la consulta");
  }
  return response.json();
}



// Editar consulta
export async function updateConsultation(token, consultationId, data) {
  const response = await fetch(`${API_URL}/api/pets/consultations/${consultationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la consulta");
  }
  return response.json();
}



// =========================================================
// ADMINISTRADOR - USUARIOS
// =========================================================

// ADMIN: obtener todos los usuarios
export async function getAdminUsers(token) {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar los usuarios");
  }
  return response.json();
}



// ADMIN: crear usuario
export async function createAdminUser(token, data) {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo crear el usuario");
  }
  return response.json();
}



// ADMIN: editar usuario
export async function updateAdminUser(token, userId, data) {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar el usuario");
  }
  return response.json();
}



// ADMIN: eliminar usuario
export async function deleteAdminUser(token, userId) {
  const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar el usuario");
  }
  return true;
}



// =========================================================
// ADMINISTRADOR - MASCOTAS, VACUNAS, MEDICAMENTOS Y CONSULTAS
// =========================================================

// ADMIN: obtener todas las mascotas
export async function getAdminPets(token) {
  const response = await fetch(`${API_URL}/api/admin/pets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las mascotas del sistema");
  }
  return response.json();
}



// ADMIN: eliminar mascota
export async function deleteAdminPet(token, petId) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la mascota");
  }
  return true;
}



// ADMIN: editar mascota
export async function updateAdminPet(token, petId, data) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la mascota");
  }
  return response.json();
}



// ADMIN: obtener vacunas de una mascota
export async function getAdminVaccines(token, petId) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/vaccines`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las vacunas de la mascota");
  }
  return response.json();
}



// ADMIN: crear vacuna para una mascota
export async function createAdminVaccine(token, petId, data) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/vaccines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo crear la vacuna");
  }
  return response.json();
}



// ADMIN: editar vacuna
export async function updateAdminVaccine(token, vaccineId, data) {
  const response = await fetch(`${API_URL}/api/admin/vaccines/${vaccineId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la vacuna");
  }
  return response.json();
}



// ADMIN: eliminar vacuna
export async function deleteAdminVaccine(token, vaccineId) {
  const response = await fetch(`${API_URL}/api/admin/vaccines/${vaccineId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la vacuna");
  }
  return true;
}



// ADMIN: obtener medicamentos de una mascota
export async function getAdminMedications(token, petId) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/medications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar los medicamentos de la mascota");
  }
  return response.json();
}



// ADMIN: crear medicamento para una mascota
export async function createAdminMedication(token, petId, data) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/medications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo crear el medicamento");
  }
  return response.json();
}



// ADMIN: editar medicamento
export async function updateAdminMedication(token, medicationId, data) {
  const response = await fetch(`${API_URL}/api/admin/medications/${medicationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar el medicamento");
  }
  return response.json();
}



// ADMIN: eliminar medicamento
export async function deleteAdminMedication(token, medicationId) {
  const response = await fetch(`${API_URL}/api/admin/medications/${medicationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar el medicamento");
  }
  return true;
}



// ADMIN: obtener consultas de una mascota
export async function getAdminConsultations(token, petId) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/consultations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las consultas de la mascota");
  }
  return response.json();
}



// ADMIN: crear consulta para una mascota
export async function createAdminConsultation(token, petId, data) {
  const response = await fetch(`${API_URL}/api/admin/pets/${petId}/consultations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo crear la consulta");
  }
  return response.json();
}



// ADMIN: editar consulta
export async function updateAdminConsultation(token, consultationId, data) {
  const response = await fetch(`${API_URL}/api/admin/consultations/${consultationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("No se pudo actualizar la consulta");
  }
  return response.json();
}



// ADMIN: eliminar consulta
export async function deleteAdminConsultation(token, consultationId) {
  const response = await fetch(`${API_URL}/api/admin/consultations/${consultationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("No se pudo eliminar la consulta");
  }
  return true;
}



// =========================================================
// VETERINARIAS Y RESERVAS
// =========================================================

async function readApiError(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data.detail || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}



// Obtener veterinarias registradas
export async function getVeterinaryClinics() {
  const response = await fetch(`${API_URL}/api/reservations/clinics`);
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudieron cargar las veterinarias")
    );
  }
  return response.json();
}



// Consultar horarios disponibles de una veterinaria
export async function getReservationAvailability(
  token,
  veterinaryId,
  appointmentDate
) {
  const params = new URLSearchParams({
    veterinary_id: String(veterinaryId),
    appointment_date: appointmentDate,
  });
  const response = await fetch(
    `${API_URL}/api/reservations/availability?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudieron cargar los horarios disponibles"
      )
    );
  }
  return response.json();
}



// Obtener reservas.
// Usuario normal: solo las suyas.
// Admin: todas las reservas.
export async function getReservations(token) {
  const response = await fetch(`${API_URL}/api/reservations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudieron cargar las reservas")
    );
  }
  return response.json();
}



// Crear una reserva
export async function createReservation(token, data) {
  const response = await fetch(`${API_URL}/api/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo registrar la reserva")
    );
  }
  return response.json();
}



// Cancelar una reserva propia
export async function cancelReservation(token, appointmentId) {
  const response = await fetch(
    `${API_URL}/api/reservations/${appointmentId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo cancelar la reserva")
    );
  }
  return response.json();
}



// OWNER: quitar una reserva finalizada del historial visible
export async function archiveReservation(
  token,
  appointmentId
) {
  const response = await fetch(
    `${API_URL}/api/reservations/${appointmentId}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo limpiar la reserva"
      )
    );
  }
  return response.json();
}



// OWNER: limpiar todas las reservas finalizadas visibles
export async function archiveFinalReservations(token) {
  const response = await fetch(
    `${API_URL}/api/reservations/archive-finalized/all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo limpiar el historial"
      )
    );
  }
  return response.json();
}



export async function archiveAdminReservation(
  token,
  appointmentId
) {
  const response = await fetch(
    `${API_URL}/api/reservations/admin/${appointmentId}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo quitar la reserva del historial administrativo"
      )
    );
  }
  return response.json();
}



export async function archiveAllAdminFinalReservations(
  token
) {
  const response = await fetch(
    `${API_URL}/api/reservations/admin/archive-finalized/all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo limpiar el historial administrativo"
      )
    );
  }
  return response.json();
}



// Admin: cambiar estado de una reserva
export async function updateReservationStatus(token, appointmentId, status) {
  const response = await fetch(
    `${API_URL}/api/reservations/${appointmentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(response, "No se pudo actualizar la reserva")
    );
  }
  return response.json();
}



// =========================================================
// HISTORIAL DE PESO DE MASCOTA
// =========================================================

export async function getPetWeights(token, petId) {
  const response = await fetch(
    `${API_URL}/api/pets/${petId}/weights`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.detail || "No se pudo cargar el historial de peso"
    );
  }
  return response.json();
}



export async function createPetWeight(token, petId, data) {
  const response = await fetch(
    `${API_URL}/api/pets/${petId}/weights`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.detail || "No se pudo registrar el peso"
    );
  }
  return response.json();
}



export async function deletePetWeight(token, weightId) {
  const response = await fetch(
    `${API_URL}/api/pets/weights/${weightId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.detail || "No se pudo eliminar el registro de peso"
    );
  }
  return true;
}



// =========================================================
// MÓDULO CLÍNICA VETERINARIA
// =========================================================

async function clinicApiError(response, fallback) {
  try {
    const data = await response.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}



export async function getClinicDashboard(token) {
  const response = await fetch(`${API_URL}/api/clinic/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo cargar el dashboard de la clínica"
      )
    );
  }
  return response.json();
}



export async function getClinicAppointments(token) {
  const response = await fetch(`${API_URL}/api/clinic/appointments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo cargar la agenda")
    );
  }
  return response.json();
}



export async function archiveClinicAppointment(
  token,
  appointmentId
) {
  const response = await fetch(
    `${API_URL}/api/clinic/appointments/${appointmentId}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo quitar la reserva de la agenda"
      )
    );
  }
  return response.json();
}



export async function archiveClinicFinalAppointments(token) {
  const response = await fetch(
    `${API_URL}/api/clinic/appointments/archive-finalized/all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await readApiError(
        response,
        "No se pudo limpiar la agenda"
      )
    );
  }
  return response.json();
}



export async function updateClinicAppointmentStatus(
  token,
  appointmentId,
  status
) {
  const response = await fetch(
    `${API_URL}/api/clinic/appointments/${appointmentId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo actualizar la hora veterinaria"
      )
    );
  }
  return response.json();
}



export async function getClinicPatients(token) {
  const response = await fetch(`${API_URL}/api/clinic/patients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudieron cargar los pacientes")
    );
  }
  return response.json();
}



export async function getClinicCatalog(
  token,
  category,
  species = ""
) {
  const params = new URLSearchParams();
  if (species) {
    params.set("species", species);
  }
  const suffix = params.toString()
    ? `?${params.toString()}`
    : "";
  const response = await fetch(
    `${API_URL}/api/clinic/catalog/${category}${suffix}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudieron cargar las opciones clínicas"
      )
    );
  }
  const data = await response.json();
  return data.options || [];
}



export async function registerClinicCatalogOption(
  token,
  category,
  species,
  name
) {
  const response = await fetch(
    `${API_URL}/api/clinic/catalog/${category}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        species: species || "",
        name,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo guardar la nueva opción clínica"
      )
    );
  }
  return response.json();
}



export async function getClinicPatientHistory(token, petId) {
  const response = await fetch(
    `${API_URL}/api/clinic/patients/${petId}/history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo cargar el historial del paciente"
      )
    );
  }
  return response.json();
}



export async function createClinicConsultation(token, petId, data) {
  const response = await fetch(
    `${API_URL}/api/clinic/patients/${petId}/consultations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo registrar la consulta")
    );
  }
  return response.json();
}



export async function createClinicVaccine(token, petId, data) {
  const response = await fetch(
    `${API_URL}/api/clinic/patients/${petId}/vaccines`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo registrar la vacuna")
    );
  }
  return response.json();
}



export async function createClinicMedication(token, petId, data) {
  const response = await fetch(
    `${API_URL}/api/clinic/patients/${petId}/medications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo registrar el medicamento")
    );
  }
  return response.json();
}



export async function deleteClinicConsultation(
  token,
  consultationId
) {
  const response = await fetch(
    `${API_URL}/api/clinic/consultations/${consultationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo eliminar la consulta"
      )
    );
  }
  return true;
}



export async function deleteClinicVaccine(
  token,
  vaccineId
) {
  const response = await fetch(
    `${API_URL}/api/clinic/vaccines/${vaccineId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo eliminar la vacuna"
      )
    );
  }
  return true;
}



export async function deleteClinicMedication(
  token,
  medicationId
) {
  const response = await fetch(
    `${API_URL}/api/clinic/medications/${medicationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo eliminar el medicamento"
      )
    );
  }
  return true;
}



export async function getClinicPrescriptionTemplates(token) {
  const response = await fetch(
    `${API_URL}/api/clinic/prescription-templates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || "No se pudieron cargar las plantillas de recetas."
    );
  }
  return response.json();
}



export async function createClinicPrescriptionTemplate(token, data) {
  const response = await fetch(
    `${API_URL}/api/clinic/prescription-templates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || "No se pudo guardar la plantilla de receta."
    );
  }
  return response.json();
}



export async function deleteClinicPrescriptionTemplate(token, templateId) {
  const response = await fetch(
    `${API_URL}/api/clinic/prescription-templates/${templateId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || "No se pudo eliminar la plantilla de receta."
    );
  }
  return true;
}



export async function getClinicPrescriptions(token) {
  const response = await fetch(`${API_URL}/api/clinic/prescriptions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudieron cargar las recetas")
    );
  }
  return response.json();
}



export async function createClinicPrescription(token, data) {
  const response = await fetch(`${API_URL}/api/clinic/prescriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo emitir la receta")
    );
  }
  return response.json();
}



export async function deleteClinicPrescription(token, prescriptionId) {
  const response = await fetch(
    `${API_URL}/api/clinic/prescriptions/${prescriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(response, "No se pudo eliminar la receta")
    );
  }
  return true;
}



// =========================================================
// MARKETPLACE / MÓDULO TIENDA
// =========================================================

async function storeApiError(response, fallback) {
  try {
    const data = await response.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}



export async function getStorefrontStores() {
  const response = await fetch(`${API_URL}/api/storefront/stores`);
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudieron cargar las tiendas"));
  }
  return response.json();
}



export async function getStorefrontProducts() {
  const response = await fetch(`${API_URL}/api/storefront/products`);
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudieron cargar los productos"));
  }
  return response.json();
}



export async function getMyStoreOrders(token) {
  const response = await fetch(`${API_URL}/api/storefront/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudieron cargar tus pedidos"));
  }
  return response.json();
}



export async function archiveMyStoreOrder(
  token,
  orderId
) {
  const response = await fetch(
    `${API_URL}/api/storefront/orders/${orderId}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo quitar el pedido del historial"
      )
    );
  }
  return response.json();
}



export async function archiveMyDeliveredOrders(
  token
) {
  const response = await fetch(
    `${API_URL}/api/storefront/orders/archive-delivered/all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudieron limpiar los pedidos entregados"
      )
    );
  }
  return response.json();
}



export async function createStorefrontOrder(token, data) {
  const response = await fetch(`${API_URL}/api/storefront/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo crear el pedido"));
  }
  return response.json();
}



export async function createStorefrontOrdersBatch(token, orders) {
  const response = await fetch(
    `${API_URL}/api/storefront/orders/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orders),
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo confirmar el carrito"
      )
    );
  }
  return response.json();
}



// =========================================================
// MERCADO PAGO - CHECKOUT PRO / ORDERS API
// =========================================================

export async function createMercadoPagoOrder(token, orders) {
  const response = await fetch(
    `${API_URL}/api/payments/mercadopago/order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orders),
    }
  );
  if (!response.ok) {
    let message = "No se pudo iniciar el pago con Mercado Pago.";
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (data.detail) {
        message = JSON.stringify(data.detail);
      }
    } catch {
      message = `Error HTTP ${response.status}`;
    }
    throw new Error(message);
  }
  return response.json();
}



export async function syncMercadoPagoOrder(token, orderId) {
  const response = await fetch(
    `${API_URL}/api/payments/mercadopago/order/${orderId}/sync`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    let message = "No se pudo sincronizar el pago con VetMap.";
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (data.detail) {
        message = JSON.stringify(data.detail);
      }
    } catch {
      message = `Error HTTP ${response.status}`;
    }
    throw new Error(message);
  }
  return response.json();
}



export async function getMercadoPagoOrderStatus(token, orderId) {
  const response = await fetch(
    `${API_URL}/api/payments/mercadopago/order/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    let message = "No se pudo consultar el estado del pago.";
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      } else if (data.detail?.message) {
        message = data.detail.message;
      }
    } catch {
      // Mantiene el mensaje por defecto.
    }
    throw new Error(message);
  }
  return response.json();
}



// =========================================================
// PANEL DE TIENDA
// =========================================================

export async function getStoreDashboard(token) {
  const response = await fetch(`${API_URL}/api/store/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo cargar el panel de tienda"));
  }
  return response.json();
}



export async function getStoreProducts(token) {
  const response = await fetch(`${API_URL}/api/store/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudieron cargar los productos de la tienda"));
  }
  return response.json();
}



export async function createStoreProduct(token, data) {
  const response = await fetch(`${API_URL}/api/store/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo crear el producto"));
  }
  return response.json();
}



export async function updateStoreProduct(token, productId, data) {
  const response = await fetch(`${API_URL}/api/store/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo actualizar el producto"));
  }
  return response.json();
}



export async function deleteStoreProduct(token, productId) {
  const response = await fetch(`${API_URL}/api/store/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo eliminar el producto"));
  }
  return response.json();
}



export async function getStoreOrders(token) {
  const response = await fetch(`${API_URL}/api/store/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudieron cargar los pedidos"));
  }
  return response.json();
}



export async function archiveStoreOrder(
  token,
  orderId
) {
  const response = await fetch(
    `${API_URL}/api/store/orders/${orderId}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo quitar el pedido del historial"
      )
    );
  }
  return response.json();
}



export async function archiveStoreFinalOrders(
  token
) {
  const response = await fetch(
    `${API_URL}/api/store/orders/archive-finalized/all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo limpiar el historial de la tienda"
      )
    );
  }
  return response.json();
}



export async function updateStoreOrderStatus(token, orderId, status) {
  const response = await fetch(`${API_URL}/api/store/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(await storeApiError(response, "No se pudo actualizar el pedido"));
  }
  return response.json();
}



// =========================================================
// ADMINISTRADOR - PRODUCTOS DE TODAS LAS TIENDAS
// =========================================================

export async function getAdminStoreProducts(token) {
  const response = await fetch(
    `${API_URL}/api/admin/store-products`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudieron cargar los productos"
      )
    );
  }
  return response.json();
}



export async function createAdminStoreProduct(
  token,
  data
) {
  const response = await fetch(
    `${API_URL}/api/admin/store-products`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo crear el producto"
      )
    );
  }
  return response.json();
}



export async function updateAdminStoreProduct(
  token,
  productId,
  data
) {
  const response = await fetch(
    `${API_URL}/api/admin/store-products/${productId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo actualizar el producto"
      )
    );
  }
  return response.json();
}



export async function deleteAdminStoreProduct(
  token,
  productId
) {
  const response = await fetch(
    `${API_URL}/api/admin/store-products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await storeApiError(
        response,
        "No se pudo eliminar el producto"
      )
    );
  }
  return response.json();
}



// =========================================================
// CENTRO DE NOTIFICACIONES
// =========================================================

async function notificationApiError(response, fallback) {
  try {
    const data = await response.json();
    return data.detail || fallback;
  } catch {
    return fallback;
  }
}



export async function getNotifications(token) {
  const response = await fetch(
    `${API_URL}/api/notifications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await notificationApiError(
        response,
        "No se pudieron cargar las notificaciones"
      )
    );
  }
  return response.json();
}



export async function markNotificationRead(
  token,
  notificationId
) {
  const response = await fetch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await notificationApiError(
        response,
        "No se pudo marcar la notificación"
      )
    );
  }
  return response.json();
}



export async function markAllNotificationsRead(token) {
  const response = await fetch(
    `${API_URL}/api/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await notificationApiError(
        response,
        "No se pudieron marcar las notificaciones"
      )
    );
  }
  return response.json();
}



// =========================================================
// ADMINISTRADOR - CATÁLOGO CLÍNICO DINÁMICO
// =========================================================

export async function getAdminClinicalCatalog(
  token,
  category,
  species = ""
) {
  const params = new URLSearchParams();
  if (species) {
    params.set("species", species);
  }
  const suffix = params.toString()
    ? `?${params.toString()}`
    : "";
  const response = await fetch(
    `${API_URL}/api/admin/clinical-catalog/${category}${suffix}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudieron cargar las opciones clínicas del administrador"
      )
    );
  }
  const data = await response.json();
  return data.options || [];
}



// =========================================================
// ADMINISTRADOR - RECETAS DE UNA MASCOTA
// =========================================================

export async function getAdminPrescriptions(
  token,
  petId
) {
  const response = await fetch(
    `${API_URL}/api/admin/pets/${petId}/prescriptions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudieron cargar las recetas"
      )
    );
  }
  return response.json();
}



export async function createAdminPrescription(
  token,
  petId,
  data
) {
  const response = await fetch(
    `${API_URL}/api/admin/pets/${petId}/prescriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo crear la receta"
      )
    );
  }
  return response.json();
}



export async function updateAdminPrescription(
  token,
  prescriptionId,
  data
) {
  const response = await fetch(
    `${API_URL}/api/admin/prescriptions/${prescriptionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo actualizar la receta"
      )
    );
  }
  return response.json();
}



export async function deleteAdminPrescription(
  token,
  prescriptionId
) {
  const response = await fetch(
    `${API_URL}/api/admin/prescriptions/${prescriptionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(
      await clinicApiError(
        response,
        "No se pudo eliminar la receta"
      )
    );
  }
  return true;
}



// =========================================================
// DUEÑO - HORARIOS Y ADMINISTRACIÓN DE MEDICAMENTOS
// =========================================================

export async function getPetMedicationSchedule(
  token,
  petId,
  scheduleDate = null
) {
  const params = scheduleDate
    ? `?schedule_date=${encodeURIComponent(scheduleDate)}`
    : "";
  const response = await fetch(
    `${API_URL}/api/pets/${petId}/medication-schedule${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.detail ||
        "No se pudieron cargar los horarios de medicamentos"
    );
  }
  return response.json();
}



export async function markMedicationAdministered(
  token,
  medicationId,
  data
) {
  const response = await fetch(
    `${API_URL}/api/pets/medications/${medicationId}/administrations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      result.detail ||
        "No se pudo registrar la dosis administrada"
    );
  }
  return response.json();
}



// =========================================================
// INFORMES PDF DE ATENCIÓN VETERINARIA
// =========================================================

export async function downloadAppointmentClinicalReport(
  token,
  appointmentId
) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    30000
  );
  try {
    const response = await fetch(
      `${API_URL}/api/reports/appointments/${appointmentId}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );
    if (!response.ok) {
      let detail =
        "No se pudo generar el informe PDF de la atención";
      try {
        const result = await response.json();
        detail = result.detail || detail;
      } catch {
        // El backend pudo responder texto plano.
        const text = await response.text().catch(() => "");
        if (text) {
          detail = text;
        }
      }
      throw new Error(detail);
    }
    const contentType =
      response.headers.get("content-type") || "";
    if (
      !contentType
        .toLowerCase()
        .includes("application/pdf")
    ) {
      const text = await response.text().catch(() => "");
      throw new Error(
        text ||
          "El servidor no devolvió un archivo PDF válido."
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) {
      throw new Error(
        "El servidor devolvió un PDF vacío."
      );
    }
    const blob = new Blob(
      [arrayBuffer],
      { type: "application/pdf" }
    );
    const disposition =
      response.headers.get("content-disposition") || "";
    const match =
      disposition.match(/filename="?([^";]+)"?/i);
    return {
      blob,
      filename:
        match?.[1] ||
        `VetMap_Atencion_${appointmentId}.pdf`,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "La generación del PDF tardó demasiado. Revisa que el backend esté funcionando."
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}