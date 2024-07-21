import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage'; // Adjust import path if needed

export const validateToken = async (userId: string, token: string): Promise<boolean> => {
    try {
        const response = await sendPostRequest(new CheckTokenMessage(parseInt(userId), token));
        return response.data === "Token is valid.";
    } catch (error) {
        console.error('Token validation failed:', error);
        return false;
    }
};