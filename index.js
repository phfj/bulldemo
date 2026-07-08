//IDEMPOTENCY
import Bull from "bull";
import dotenv from "dotenv";
import express from "express";
import { setTimeout as sleep } from "timers/promises";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

//load environment variables
dotenv.config();

const TIME = 4000;

//create redis options with the redis details (bull queue will be connected to the redis server, so we create this redis option)
const  { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

//QUEUE OPTIONS
const queueOptions = {
    redis: { host:  REDIS_HOST, port: REDIS_PORT,  password: REDIS_PASSWORD },
    limiter: {
        max:1,
        duration:10000,
    }
};
//limit option throttle the function execution

//DEFINE QUEUE
const burgerQueue = new Bull("burger", queueOptions); //name of queue is burger (burguerQueue object created using Bull class)

//REGISTER PROCESSOR (consumer)
//the function will execute when a new job is added to the burger queue
burgerQueue.process(async (job) => {
    /**console.log("Preparing the burger!");
    setTimeout(() => {
        console.log("Burger ready!");
        done(); //called to indicate that the process has finised
    }, 4000);**/

    try{
        //STEP 1
        await job.log("Grill the patty.");
        await job.progress(20);
        await sleep(TIME);

        //STEP 2
        //25% chance of failure (let's see what happens when the job fails at step 2)
        if(Math.random() > 0.25) throw new Error("Toast burnt!");
        await job.log("Toast the buns.");
        await job.progress(40);
        await sleep(TIME);

        //STEP 3
        await job.log("Add toppings.");
        await job.progress(60);
        await sleep(TIME);

        //STEP 4
        await job.log("");
        await job.log("Assemble layers.");
        await job.progress(80);
        await sleep(TIME);

        //STEP 5
        await job.log("Burger ready");
        await job.progress(100);
    }catch(err){
        throw err;
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

    const jobs = [...new Array(5)].map(_ => ({
        bun: "🍔",
        cheese: "🧀",
        toppings: ["🍅","🫑","🥬","🌶️"],
    }));

    //ADD JOB TO THE QUEUE
    await Promise.all(jobs.map((job) => burgerQueue.add(job, {attempts: 3})));
});
