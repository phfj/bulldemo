//SIMPLE QUEUE
import Bull from "bull";
import dotenv from "dotenv";
import express from "express";
import { setTimeout as sleep } from "timers/promises";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

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
burgerQueue.process(async (job, done) => {
    /**console.log("Preparing the burger!");
    setTimeout(() => {
        console.log("Burger ready!");
        done(); //called to indicate that the process has finised
    }, 4000);**/

    try{
        //STEP 1
        job.log("Grill the patty.");
        job.progress(20);
        await sleep(5000);

        //STEP 2
        job.log("Toast the buns.");
        job.progress(40);
        await sleep(5000);

        //STEP 3
        job.log("Add toppings.");
        job.progress(60);
        await sleep(5000);

        //STEP 4
        job.log("");
        job.log("Assemble layers.");
        job.progress(80);
        await sleep(5000);

        //STEP 5
        job.log("Burger ready");
        await job.progress(100);
        done();
    }catch(err){
        done(err);
    }
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullAdapter(burgerQueue)],
    serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(4000, async() => {
    console.log("Bull Board running at http://localhost:4000/admin/queues");

    //ADD JOB TO THE QUEUE
    await burgerQueue.add({
        bun: "🍔",
        cheese: "🧀",
        toppings: ["🍅","🫑","🥬","🌶️"],
    });
});
