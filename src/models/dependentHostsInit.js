import axios from 'axios';
import logger from "../utils/log.js";

const log = logger("models");

const dependentHostsInit = async () => {
    try {
      const frontendRes = await axios.get("http://0.0.0.0/healthcheck"); 
      if (frontendRes.status === 200 && frontendRes.data.message == 'OK') {
        log.info("capstone-frontend server is running");
      } else {
        log.error("Failed to verify if capstone-frontend server is running");
      }

      const backendRes = await axios.get("http://0.0.0.0:5000/healthcheck"); 
      if (backendRes.status === 200 && backendRes.data.message == 'OK') {
        log.info("capstone-backend server is running");
      } else {
        log.error("Failed to verify if capstone-backend server is running");
      }
    } catch (error) {
      log.error("Failed to connect to dependent servers:", error.message);
      process.exit(1); // Terminate the process with a non-zero exit code
    }
}

export default dependentHostsInit;
