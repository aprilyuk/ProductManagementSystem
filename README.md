Product Management System

Group: 87
Name: 
Tsang Yuk Ting (12983304)

Application link: https://projectsample381.render.com/

Welcome to the README file for the Product Management System. This document provides an overview of the system, its functionalities, and the available API endpoints.
********************************************
# Login
To access the Product Management System, users need to log in by entering their username and password. Each user has a unique userID and password combination.

Each user has a userID and password;
[
	{userid: admin1, password: 123456},
	{userid: admin2, password: 123456}

]

After a successful login, the userID is stored in the session for authentication purposes.

********************************************
# Logout
Users can log out of their accounts by clicking the logout button located at the bottom of the home page.

********************************************
# CRUD service
The Product Management System supports CRUD operations for managing product information. The following operations are available:

- Create
-	A product information may contain the following attributes with an example: 
	1)	Product id (001)
	2)	Product name (Vitasoy)
	3)	Description (Tasty soymilk)
	4)	Category (Drink)
	5)	Price (4)

All attributes are mandatory.

The create operation is performed using a POST request, with all the required information provided in the request body.

********************************************
# CRUD service
- Read
-  There are two options to read and find product list all information or searching by product id.

1) List all information
	The home page displays all product information.

2) Searching by product id
	click serach button in home page, it will direct you to search page
	input id of product you want to find (003);
	id is in the body of post request, and in details.ejs product details will be displayed;

********************************************
# CRUD service
- Update
-	The user can update the product price through the details interface.
-	To update a product, the user must provide the following attributes:
	Product ID (as the search criteria)
	New Price
	The update operation is performed using a PUT request, with the product ID as the search criteria and the updated price provided in the request body.

-	A product information may contain the following attributes with an example: 
	1)	Product id (001)
	2)	Product name (Vitasoy)
	3)	Description (Tasty soymilk)
	4)	Category (Drink)
	5)	Price (3)

	In example, we updated the product price.

********************************************
# CRUD service
- Delete
-	The user can delete the product information through the details interface.

********************************************
# Restful
In this project, there are four HTTP request types, post, get, put and delete.
- Post 
	Post request is used for insert (create) operations.
	Path URL: /api/item/insert
	Test: curl -X POST -H "Content-Type: application/json" --data '{"productID": "001", "productName":"Vitasoy", "description":"Tasty soymilk", "category":"Drink", "price":4}' http://localhost:8099//api/item/insert

- Get
	Get request is used for find.
	Path URL: /api/item/find/:itemID
	Test: curl -X GET http://localhost:8099/api/item/find/001

- Put
	Put request is used for update the price of a product.
	Path URL: /api/item/update/:itemID/:price
	Test: curl -X PUT -H "Content-Type: application/json" --data '{"price": 5}' http://localhost:8099/api/product/001/5

- Delete
	Delete request is used for deletion.
	Path URL: /api/item/delete/:itemID
	Test: curl -X DELETE http://localhost:8099//api/item/delete/001

For all restful CRUD services, login should be done at first.



