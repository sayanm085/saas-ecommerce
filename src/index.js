import connectDB from "./db/Database.js";
import app from "./app.js";
import dotenv from 'dotenv';
import os from 'os';
import cluster from "cluster";


dotenv.config();

// let totalCPUs = os.cpus().length;
// console.log(`Total CPUs: ${totalCPUs}`);

// if(cluster.isMaster){
//     const cpus = os.cpus().length;
//     for(let i = 0; i < cpus; i++){
//         cluster.fork();
//     }
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`);
//         cluster.fork();
//     });

// }

// if(cluster.isWorker){
//     connectDB()
//     .then(() => {
//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`Server is running on port http://localhost:${process.env.PORT} ||8000`);
//         });
//     })
//     .catch((error) => {
//         console.log("error in db connection" , error);
//         process.exit(1);
//     });
// }





connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port http://localhost:${process.env.PORT} ||8000`);
    });
})
.catch((error) => {
    console.log("error in db connection" , error);
    process.exit(1);
});