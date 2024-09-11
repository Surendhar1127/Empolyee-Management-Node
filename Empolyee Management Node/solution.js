// const secretKey = process.env.JWT_SECRET;
require('dotenv').config();
const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const { EmployeeManagement } = require('./models'); 
const authenticateToken = require("./authMiddleware");
const {Register} =require("./models")

const server = http.createServer(async (req, res) => {
    const { method, url: requestUrl } = req;
    const parsedUrl = url.parse(requestUrl, true);
    const path = parsedUrl.pathname;

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
        authenticateToken(req,res,async()=>{
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
    });
    } else if (path.startsWith('/employees/update/') && method === 'PUT') {
        authenticateToken(req,res,async()=>{
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
    });
    } else if (path.startsWith('/employees/delete/') && method === 'DELETE') {
        authenticateToken(req,res,async()=>{
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

    });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
