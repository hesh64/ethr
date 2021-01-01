# ethr
 Account balances and stuff

# steps to run
1. npm install
2. npm start

# a brief overview of the application
The problem that we are trying to solve here is the following:

We have x many bank accounts sitting in a text file.
We must read them, and call an external api to get their balance.

We must be able to process 100M bank accounts within a 3 hours.

## The solution I proposed:
###steps:
1) read a bank account
2) enqueue it
3) dequeue it
4) get the balance on the account
5) cache it in redis 

###assumptions:
1. From experimenting with the web3 API I learned that a bank account balance call takes 200-450ms 
2. An enqueue / dequeue into RabbitMq averaged 1-5ms
3. A write into redis averaged 5-10ms

####My calculations were:
* Reading then enqueuing 1 million records locally took an average of 40 seconds but let's round to 1 minute.
* With a base model macbook pro that can run 12 node.js instances
* Reading of 100M accounts and enqueueing should take no more than 8.5 minutes, but we can round it up to 10 minutes
* We have 170 minutes left - given each node.js instance can comfortably handle 500 requests at any given time each costing 500 ms on average
* -> that's 12,000 / sec for all 12 instances.
* -> 100M/12,000 = 8333sec / 60 = 138 minutes but let's round up to 140. 
* -> total time spent is 150 minutes.

###Blockers / Unknowns:
* My only bottleneck was my RabbitMq
* Even running it through a cloud service got me blocked when I tired running 12 million messages
* I don't think Rabbit Mq can't handle this workload, it's just my setup / hardware wasn't well-prepared
* Alternatives to RabbitMq would have been Kafka or EventHubs. Evenhubs shines at handling bursts of this type of events
  
###Conclusion
Hopefully I didn't miscalculate anything 
