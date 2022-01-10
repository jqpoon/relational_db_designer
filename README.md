# Relational Database Designer

This project aims to create an editor for schemas expressed in the ER modelling language as used on the Introduction to Databases course. The project’s target audience would be the students of the Introduction to Databases course. The final product should include a Graphical User Interface (GUI), a backend, and a repository of models created. The models created should thus be accessible via an API, and should be saved and loaded in a number of textual formats for exchange (such as JSON and XML). Possible extensions include reverse engineering relational schemas to derive the original ER model, handling very large ER schemas, and allowing concurrent access and editing of schemas.

### Development quick start

Before running the project, simply setup a (dot)env file in the backend containing Firebase credentials. _/backend/src/controllers/firebaseController.ts_ can be used as reference on what exactly is needed.

To run the project, run commands `npm run start:dev` from the backend directory and `npm start` from the client directory.
