// API Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

class PortfolioAPI {
    async getData(section) {
        try {
            const response = await fetch(`${API_BASE_URL}/data/${section}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return simpleDB.get(section) || {};
        }
    }

    async saveData(section, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/data/${section}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                simpleDB.set(section, data);
            }
            return result;
        } catch (error) {
            console.error('API Error:', error);
            simpleDB.set(section, data);
            return { success: true };
        }
    }

    async getPhotos() {
        try {
            const response = await fetch(`${API_BASE_URL}/photos`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return simpleDB.get('photos') || [];
        }
    }

    async addPhoto(photoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/photos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(photoData)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            const photos = simpleDB.get('photos') || [];
            photoData.id = Date.now();
            photos.push(photoData);
            simpleDB.set('photos', photos);
            return { success: true };
        }
    }
}

const portfolioAPI = new PortfolioAPI();