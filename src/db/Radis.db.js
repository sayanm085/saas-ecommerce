import redis from 'redis';

// Create a new redis client

// you can use the following options to connect to the redis server on your local machine 
// install docker and run the following command to start a redis server on your local machine
// redis img download: docker pull redis
// docker run --name redis -p 6379:6379 -d redis
// const redisClient = redis.createClient({host: 'localhost', port: 6379});



const redisClient = redis.createClient({});



redisClient.on("error", (err) => console.error("Redis Error:", err));

redisClient.connect();

export default redisClient;