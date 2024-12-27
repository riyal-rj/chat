import http from 'http';
import app from './app.js';
import { ENV_VARS } from './config/envVars.js';



const server=http.createServer(app);



const PORT=ENV_VARS.PORT;;
server.listen(PORT,()=>{
    console.log(`Server started on port ${process.env.PORT}`);
})

