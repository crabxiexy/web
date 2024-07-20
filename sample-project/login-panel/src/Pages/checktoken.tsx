import { sendPostRequest } from 'Plugins/CommonUtils/APIUtils';
import { CheckTokenMessage } from 'Plugins/DoctorAPI/CheckTokenMessage'; // Adjust the path as necessary
import useIdStore from './IdStore';
import useTokenStore from './TokenStore';

// Function to check token validity
export const checkToken = async () => {
    try {
        // Create CheckTokenMessage object
        const {Id} = useIdStore();
        const {Token} = useTokenStore();
        const checkTokenMessage = new CheckTokenMessage(parseInt(Id), Token);

        // Send POST request to check token
        const tokenResponse = await sendPostRequest(checkTokenMessage);

        return tokenResponse.data === "Token is valid.";
    } catch (error) {
        console.error('Token Check Error:', error.message);
        throw new Error("Failed to check token.");
    }
};