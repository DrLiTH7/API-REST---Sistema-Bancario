const express = require('express');
const routes = express();
const { listAcc, createAcc, updateAccUser, deleteAcc, deposit, withdraw, transfer, balance, statement } = require('../controlers/controlers.js');
const { verifyRequirements, accCreationRequirements, updateAccRequirements, deleteRequirementes, depositRequirements, withdrawRequirements, transferRequirements, balanceStatementRequirements } = require('../controlers/middlewares.js');



routes.get('/contas', verifyRequirements, listAcc);

routes.post('/contas', accCreationRequirements, createAcc);

routes.put('/contas/:numeroConta/usuario', updateAccRequirements, updateAccUser);

routes.delete('/contas/:numeroConta', deleteRequirementes, deleteAcc);

routes.post('/transacoes/depositar', depositRequirements, deposit);

routes.post('/transacoes/sacar', withdrawRequirements, withdraw);

routes.post('/transacoes/transferir', transferRequirements, transfer);

routes.get('/contas/saldo', balanceStatementRequirements, balance);

routes.get('/contas/extrato', balanceStatementRequirements, statement);


module.exports = routes;