# Install depences
````
npm i
````
# Run koa app in local
````
npm run start
````
# Run test
````
npm run test
````
# Algorithm
For this exercise,  I use kdtree algorithm. I load all points of interest in the request body to a kdtree.
And then, I read file one line by one line and search the nearest point in the kdtree. The average search time complexity is O(log n).