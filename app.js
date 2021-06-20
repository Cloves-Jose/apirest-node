const express = require('express');
const app = express();
const morgan = require('morgan');
//const bodyParser = require('body-parser');

const rotaProdutos = require('./routes/produtos');
const rotaPedidos = require('./routes/pedidos');
const rotaUsuarios = require('./routes/usuarios');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); //apenas dados simples
app.use(express.json()); //aceita apenas entrada json

app.use((req, res, next) => {
    res.header('Access-Controle-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Header', 
        'Origin, X-Requrested-With, Content-Type, Accept, Authorization'
        );

        if (req.method === 'OPTIONS') {
            res.header('Acccess-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).send({});
        }

        next();
})

app.use('/produtos', rotaProdutos);
app.use('/pedidos', rotaPedidos);
app.use('/usuarios', rotaUsuarios);

//Tratamento para quando não for encontrada nenhuma rota
app.use((req, res, next) => {
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: erro.mensage
        }
    });
});



module.exports = app;