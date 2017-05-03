## Documentation
### What is it?
#### Travel Life is an itinerary website that provides one day itinerary for each destination. You can simply type in a random destination and get a perfect one day itinerary. Inside of each itinerary, the system will returns 4 places to have fun and 2 restaurants for meal.

<img width="1431" alt="background" src="https://cloud.githubusercontent.com/assets/13953337/25626355/4c3c876e-2f2d-11e7-95ac-a0a0653581dd.png">



### How it works?
#### Here I used Google Place Api: Using google place type to query and get the name, address, rating from each destination. I attached the google place api node.js as follows.

<img width="805" alt="api" src="https://cloud.githubusercontent.com/assets/13953337/25626435/832c854e-2f2d-11e7-91be-d0ee5c1fa94a.png">
<img width="826" alt="api2" src="https://cloud.githubusercontent.com/assets/13953337/25626440/86903762-2f2d-11e7-92bd-c9d15e73af38.png">


### My code
#### Since google place api doesn't have a specific place type called attractions or things to do, so I have to query those places by different place type, I am using restaurant, park ,church and mesume for my project. First I created a variable for location based on the input from user and then searching the places within the range of that location.



