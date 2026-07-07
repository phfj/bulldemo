//SIMPLE QUEUE
import Bull from "bull";
import dotenv from "dotenv";

//load environment variables
dotenv.config();

//create redis options with the redis details (bull queue will be connected to the redis server, so we create this redis option)
const  { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;
const redisOptions = {
    redis: { host:  REDIS_HOST, port: REDIS_PORT,  password: REDIS_PASSWORD },
};

//DEFINE QUEUE
const burgerQueue = new Bull("burger", redisOptions); //name of queue is burger (burguerQueue object created using Bull class)

//REGISTER PROCESSOR (consumer)
//the function will execute when a new job is added to the burger queue
burgerQueue.process((payload, done) => {
    console.log("Preparing the burger!");
    setTimeout(() => {
        console.log("Burger ready!");
        done(); //called to indicate that the process has finised
    }, 4000);
});

//ADD JOB TO THE QUEUE
burgerQueue.add({
    bun: "🍔",
    cheese: "🧀",
    toppings: ["🍅","🫑","🥬","🌶️"],
});