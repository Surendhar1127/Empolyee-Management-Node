// const secretKey = process.env.JWT_SECRET;
require('dotenv').config();
const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const { EmployeeManagement } = require('./models'); 
const authenticateToken = require("./authMiddleware");
const {Register} = require('./models');
const { where } = require('sequelize');

const server = http.createServer(async (req, res) => {
    const { method, url: requestUrl } = req;
    console.log(req.method);
    const parsedUrl = url.parse(requestUrl, true);
    console.log(parsedUrl);
    const path = parsedUrl.pathname;
    console.log(path);

    console.log(`${method} ${path}`);

    if (path === '/login' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', async() => {
          const { name, password } = JSON.parse(body);
          try{
const user=await Register.findOne({where:{name}});


if (!user) {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({ message: 'Invalid credentials' }));
}

if(user.password===password){
  const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });          
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ token }));
}else {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Invalid credentials' }));
}
          }catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
          // if (username === 'user' && password === 'password') {
          //     const user = { id: 1, username: 'user' };
          //     const token = jwt.sign(user,process.env.JWT_SECRET, { expiresIn: '1h' });
          //     res.writeHead(200, { 'Content-Type': 'application/json' });
          //     res.end(JSON.stringify({ token }));
          // } else {
          //     res.writeHead(401, { 'Content-Type': 'application/json' });
          //     res.end(JSON.stringify({ message: 'Invalid credentials' }));
          // }
      });
  }

    else if (path === '/register' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        console.log(body);
        req.on('end', async () => {
            const { name, password } = JSON.parse(body);
            console.log(name,password);
            try {
              const result = await Register.create({name, password });
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
          } catch (err) {
            console.log(1);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Server error' }));
          }
            
        });
    } else if (path === '/employees' && method === 'GET') {
        authenticateToken(req, res, async () => {
            try {
                const employees = await EmployeeManagement.findAll();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(employees));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Server error' }));
            }
        });
    } else if (path === '/employees/create' && method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { name, position, salary } = JSON.parse(body);
            try {
                const result = await EmployeeManagement.create({ name, position, salary });
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Server error' }));
            }
        });
    } else if (path.startsWith('/employees/update/') && method === 'PUT') {
        const id = path.split('/').pop();
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const { name, position, salary } = JSON.parse(body);
            try {
                const result = await EmployeeManagement.findByPk(id);
                if (!result) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Employee not found' }));
                    return;
                }

                result.name = name;
                result.position = position;
                result.salary = salary;

                await result.save();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Server error' }));
            }
        });
    } else if (path.startsWith('/employees/delete/') && method === 'DELETE') {
        const id = path.split('/').pop();
        try {
            const result = await EmployeeManagement.findByPk(id);
            if (!result) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Employee not found' }));
                return;
            }

            await result.destroy();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Employee deleted' }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Server error' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});



// require('dotenv').config();
// const express =require("express");
// const {EmployeeManagement}=require("./models");
// const authenticateToken = require("./authMiddleware");
// const jwt=require('jsonwebtoken');


// const app=express();
// app.use(express.json());
// const port=3000;


// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
//   });

//   app.get('/employees',authenticateToken,async (req,res)=>{
//     try{
//     const employees=await EmployeeManagement.findAll();
//     res.json(employees);
//     }catch(err){
//       res.status(500).json({ message: 'Server error' });
//         console.log(err);
//     }
//   });


//   app.post('/employees/create',async(req,res)=>{
//     try{
        
// const{name,position ,salary}=req.body;
// const result=await EmployeeManagement.create({name,position ,salary});
// res.status(201).json(result);
//     }catch(err){
//         console.log(err);
//         res.status(401);
//     }
//   });

//   app.put('/employees/update/:id',async (req,res)=>{
//     try{
//     const { id } = req.params;
//     const{name,position,salary}=req.body;
//     const result=await EmployeeManagement.findByPk(id);
//     if (!result) {
//         return res.status(404).json({ error: 'Employee not found' });
//     }

//     result.name=name;
//     result.position=position;
//     result.salary=salary;

//     await result.save();
//     res.json(result);
// }catch(err){
//     console.log(err);
//     res.status(401);
// }
//   });

//   app.delete('/employees/delete/:id', async(req,res)=>{
//     try{
//         const {id}=req.params;
//         const result=await EmployeeManagement.findByPk(id);
//         if(!result){
//             return res.status(404).json("Employess not found");
//         }

//        await result.destroy();
//        res.json({ message: 'Employee deleted' });

//     }catch(err){
//         console.log(err);
//         res.status(401);
//     }
//   });


// app.post('/login', async (req, res) => {

//   const { username, password } = req.body;
//   if (username === 'user' && password === 'password') {
  
//     const user = { id: 1, username: 'user' }; 
//     const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' }); 
//     res.json({ token });
//   } else {
//     res.status(401).json({ message: 'Invalid credentials' });
//   }
// });


 

//   app.listen(port,()=>{
//     console.log("server is running");
//   })
