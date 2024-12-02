# Qooldown

To run the backend program, install Go by following the instructions on Go's official site.

```bash
make # build the project on local machine
make up # run DB, Adminer, and the backend in docker
# NOTE: Mysql takes time to start, during that time the qooldown binary restarts continuously
# I might fix that later by adding a wait.

# To test the bin in docker use localhost:8881
# Access to adminer locahlost:8880

make rundev # Run a local qooldown instance on localhost:9991
# Once Mysql is up, we can run locally to not destroy the DB.

make down # destroy everything

# TODO: I might add a build step to just update qooldown binary
```
