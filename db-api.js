// Firebase Firestore Database Integration
// Fully replaces the PHP and Supabase backends.

class DentalDB {
    constructor() {
        console.log('✅ Connecting to Firebase Firestore...');
        this.db = firebase.firestore();
    }

    // Get all appointments
    async getAppointments() {
        try {
            const snapshot = await this.db.collection('appointments').orderBy('id', 'desc').get();
            const appointments = [];
            snapshot.forEach((doc) => {
                appointments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return appointments;
        } catch (error) {
            console.error('Firestore Error (getAppointments):', error);
            // If it fails (e.g., missing index), fallback to unordered lookup
            try {
                const snapshot = await this.db.collection('appointments').get();
                const appointments = [];
                snapshot.forEach((doc) => {
                    appointments.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                return appointments;
            } catch (fallbackError) {
                console.error('Firestore Error (Fallback getAppointments):', fallbackError);
                return [];
            }
        }
    }

    // Create new appointment
    async createAppointment(appointment) {
        try {
            // Because the frontend HTML passes app.id without quotes in onClick handlers 
            // like onClick="deleteAppointment(${app.id})", we MUST ensure the ID remains numeric.
            const newId = (appointment.id || Date.now()).toString();

            await this.db.collection('appointments').doc(newId).set({
                id: parseInt(newId),
                name: appointment.name,
                place: appointment.place || '',
                mobile: appointment.mobile,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                reason: appointment.reason || '',
                fee: appointment.fee || 0,
                status: appointment.status || 'Pending',
                date: appointment.date || new Date().toLocaleDateString(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return {
                id: newId,
                ...appointment
            };
        } catch (error) {
            console.error('Firestore Error (createAppointment):', error);
            return appointment;
        }
    }

    // Update appointment
    async updateAppointment(id, updates) {
        try {
            await this.db.collection('appointments').doc(id.toString()).update(updates);
            return { id, ...updates };
        } catch (error) {
            console.error('Firestore Error (updateAppointment):', error);
            return null;
        }
    }

    // Delete appointment
    async deleteAppointment(id) {
        try {
            await this.db.collection('appointments').doc(id.toString()).delete();
            return true;
        } catch (error) {
            console.error('Firestore Error (deleteAppointment):', error);
            return false;
        }
    }
}

// Export singleton instance
window.dbAPI = new DentalDB();
