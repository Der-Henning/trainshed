## **Persons**

Show and manage Persons

- **Show all Persons**

**URL**
`GET /api/v1/person`

**URL Params**
none

**Data Params**
none

**Success Response:**

- **Code:** 200 OK<br />
  **Content:** `{ id : 12, persNum : 12345678, name : "Bloom" , givenName : "Michael" , Unit : { name : "QM" } , Trainer : { }}`

**Error Response:**

- **Code:** 400 Bad Request<br />
  **Content:** `{ "ErrNum" : 1, "message" : "missing parameter(s)" }`

OR

- **Code:** 401 UNAUTHORIZED <br />
  **Content:** `{ error : "You are unauthorized to make this request." }`

OR

- **Code:** 500 INTERNAL SERVER ERROR <br />
  **Content:** `{ "ErrNum" : 2, "message" : "internal server error" }`