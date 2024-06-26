const fs = require ("fs");
const jwt = require ("jsonwebtoken")
require("dotenv").config()
const nodemailer = require('nodemailer');

const getProjects = async (req, res) => {
  try {
    const data = await fs.readFileSync('./userData.json', 'utf8');
    const json = JSON.parse(data);
    res.status(200).json(json);
  } catch (error) {
    console.error('Error al leer los proyectos del archivo JSON:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

const addProjects = async (req, res) => {
    try {

        const data = await fs.readFileSync('./userData.json','utf8');
        const json = JSON.parse(data);

        json.push(req.body);

        await fs.writeFileSync('userData.json', JSON.stringify(json));
    
        res.send('Objeto agregado al archivo JSON correctamente');
      } catch (error) {
        console.error('Error al agregar el objeto al archivo JSON:', error);
        res.status(500).send('Error al procesar la solicitud');
      }
}

const deleteUser = async (req, res) => {
  
  try {   
    const idToDelete = req.params?.id;
    const data = await fs.readFileSync('./userData.json', 'utf8');
    const json = JSON.parse(data);
    
    const filteredArray = json.filter(item => item.id !== idToDelete);
    
    if (filteredArray.length !== json.length) {
      await fs.writeFileSync('userData.json', JSON.stringify(filteredArray), 'utf8');
      res.send(`Objeto con ID ${idToDelete} eliminado correctamente`);
    } else {
      res.status(404).send(`No se encontró ningún objeto con ID ${idToDelete}`);
    }
  } catch (error) {
    console.error('Error al eliminar el objeto del archivo JSON:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
}

const editField = async (req, res) => {
  
  try {   
    const fieldToEdit = req.body;
    const idToEdit = req.params?.id;
    const data = await fs.readFileSync('./userData.json', 'utf8');
    const json = JSON.parse(data);
    
    const filteredField = json.map((item) => {
      if (idToEdit !== item.id) return item
      return {
        ...item,
        ...fieldToEdit
      }
    });

    await fs.writeFileSync ('userData.json', JSON.stringify(filteredField), 'utf8');
    res.send('Campo editado correctamente')

  } catch (error) {
    console.error('Error al eliminar el objeto del archivo JSON:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
}

const hideProject = async (req, res) => {
  try {
    const idToHide = req.params.id;
    const data = await fs.readFileSync('./userData.json', 'utf8');
    const json = JSON.parse(data);
    
    const updatedProjects = json.map((project) => {
      if (project.id === idToHide) {
        return { ...project, visible: !project.visible };
      }
      return project;
    });
    
    await fs.writeFileSync('userData.json', JSON.stringify(updatedProjects), 'utf8');
    res.send(`Proyecto con ID ${idToHide} actualizado correctamente`);
  } catch (error) {
    console.error('Error al ocultar el proyecto:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

const login = (req, res) => {
  try {
    const logedUser = req.body.user;
    const userPass = req.body.password;
    console.log(logedUser, userPass)
    if (logedUser !== process.env.USER_NAME || userPass !== process.env.USER_PASSWORD) return res.send("Usuario incorrecto")
    jwt.sign({name: logedUser}, process.env.SECRETJWT, {expiresIn: '1h'}, (error,token) => {
      if (error) {
        throw error;
    }
    res.status(200).json({ message: 'Logeo exitoso', token });
    })

  } catch (error) {
    console.error('Error al eliminar el objeto del archivo JSON:', error);
    res.status(500).send('Error al procesar la solicitud')
  }
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/-/g," "),
  },
});

const sendMail = (req, res) => {
  const { name, email, phone, comments } = req.body;
  const file = req.file;

  const mailOptions = {
    to: process.env.RECIPIENT_EMAIL,
    subject: `Nuevo contacto de ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\nComentarios: ${comments}`,
    attachments: file ? [{ filename: file.originalname, path: file.path }] : [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email');
    }
    res.status(200).json({ message: 'Envío exitoso' });
  });
}

module.exports = {
  getProjects,
  addProjects,
  deleteUser,
  editField,
  login,
  hideProject,
  sendMail
}
