const fsPromises = require('fs').promises;
const bancodedados = require('../database/bancodedados.js')
const { contas } = bancodedados


function nowTimestamp() {
    const tmstmp = new Date().getTime()
    return tmstmp
}
// function indexAcc
// function fileWriter


const listAcc = (req, res) => {
    return res.json(bancodedados.contas)
};

const createAcc = async (req, res) => {
    try {
        let fileContent = bancodedados
        const reqForm = {
            id: nowTimestamp(),
            nome: req.body.nome,
            cpf: req.body.cpf,
            data_nascimento: req.body.data_nascimento,
            telefone: req.body.telefone,
            email: req.body.email,
            senha: req.body.senha,
            saldo: 0
        }
        fileContent.contas.push(reqForm)

        const fileContentString = JSON.stringify(fileContent)
        const newContent = "module.exports = " + fileContentString

        await fsPromises.writeFile('./src/database/bancodedados.js', newContent)

        return res.status(201).send();

    } catch (error) {
        return res.status(500).json({ "mensagem": "Erro interno do servidor" })
    }
};

const updateAccUser = async (req, res) => {

    let fileContent = bancodedados
    let indexAcc = 0
    for (let conta of fileContent.contas) {
        if (conta.id === parseInt(req.params.numeroConta)) {
            break
        } else {
            indexAcc++
        }
    }
    fileContent.contas[indexAcc].nome = req.body.nome
    fileContent.contas[indexAcc].cpf = req.body.cpf
    fileContent.contas[indexAcc].data_nascimento = req.body.data_nascimento
    fileContent.contas[indexAcc].telefone = req.body.telefone
    fileContent.contas[indexAcc].email = req.body.email
    fileContent.contas[indexAcc].senha = req.body.senha



    const fileContentString = JSON.stringify(fileContent)
    const newContent = "module.exports = " + fileContentString

    try {
        await fsPromises.writeFile('./src/database/bancodedados.js', newContent)
        return res.status(201).send()
    } catch (error) { return res.status(500).json({ "mensagem": "Erro interno do servidor" }) }
};

const deleteAcc = async (req, res) => {
    let fileContent = bancodedados
    let indexAcc = 0
    for (let conta of fileContent.contas) {
        if (conta.id === parseInt(req.params.numeroConta)) {
            break
        } else {
            indexAcc++
        }
    }
    fileContent.contas.splice(indexAcc, 1)

    const fileContentString = JSON.stringify(fileContent)
    const newContent = "module.exports = " + fileContentString

    try {
        await fsPromises.writeFile('./src/database/bancodedados.js', newContent)
        return res.status(204).send()
    } catch (error) { return res.status(500).json({ "mensagem": "Erro interno do servidor" }) }
};

const deposit = async (req, res) => {
    let fileContent = bancodedados
    let indexAcc = 0
    for (let conta of fileContent.contas) {
        if (conta.id === parseInt(req.body.numero_conta)) {
            break
        } else {
            indexAcc++
        }
    }
    const prevSaldo = parseInt(fileContent.contas[indexAcc].saldo)
    fileContent.contas[indexAcc].saldo = prevSaldo + parseInt(req.body.valor)

    const registerDeposit = {
        "data": new Date(),
        "numero_conta": fileContent.contas[indexAcc].id,
        "valor": req.body.valor
    }
    fileContent.depositos.push(registerDeposit)

    const fileContentString = JSON.stringify(fileContent)
    const newContent = "module.exports = " + fileContentString
    try {
        await fsPromises.writeFile('./src/database/bancodedados.js', newContent)
        return res.status(204).send()
    } catch (error) { return res.status(500).json({ "mensagem": "Erro interno do servidor" }) }


};

const withdraw = async (req, res) => {
    let fileContent = bancodedados
    let indexAcc = 0
    for (let conta of fileContent.contas) {
        if (conta.id === parseInt(req.body.numero_conta)) {
            break
        } else {
            indexAcc++
        }
    }
    const prevSaldo = parseInt(fileContent.contas[indexAcc].saldo)
    const bodyValor = parseInt(req.body.valor)
    if (prevSaldo >= bodyValor) {
        fileContent.contas[indexAcc].saldo = (prevSaldo - bodyValor)

        const registerDeposit = {
            "data": new Date(),
            "numero_conta": fileContent.contas[indexAcc].id,
            "valor": req.body.valor
        }
        fileContent.saques.push(registerDeposit)

        const fileContentString = JSON.stringify(fileContent)
        const newContent = "module.exports = " + fileContentString
        try {
            await fsPromises.writeFile('./src/database/bancodedados.js', newContent)
            return res.status(204).send()
        } catch (error) { return res.status(500).json({ "mensagem": "Erro interno do servidor" }) }

    } else {
        return res.status(403).json({ "mensagem": "Você não tem saldo suficiente." })
    }
};

const transfer = async (req, res) => {
    fileContent = bancodedados

    const idOrigin = contas.find((conta) => {
        return conta.id === parseInt(req.body.numero_conta_origem)
    })
    const idDestiny = contas.find((conta) => {
        return conta.id === parseInt(req.body.numero_conta_destino)
    })
    const indexOrigin = contas.indexOf(idOrigin)
    const indexDestiny = contas.indexOf(idDestiny)

    if (idOrigin.saldo >= req.body.valor) {
        fileContent.contas[indexOrigin].saldo -= req.body.valor
        fileContent.contas[indexDestiny].saldo += req.body.valor

        const regTransfer = {
            "data": new Date(),
            "numero_conta_origem": req.body.numero_conta_origem,
            "numero_conta_destino": req.body.numero_conta_destino,
            "valor": req.body.valor
        }

        fileContent.transferencias.push(regTransfer)
        const fileContentString = JSON.stringify(fileContent)
        const newContent = "module.exports = " + fileContentString
        try {
            await fsPromises.writeFile('./src/database/bancodedados.js', newContent)
            return res.status(204).send()
        } catch (error) { return res.status(500).json({ "mensagem": "Erro interno do servidor" }) }

    } else {
        return res.status(403).json({ "mensagem": "Você não possui saldo sufuciente." })
    }
};

const balance = (req, res) => {
    const idAcc = contas.find((conta) => {
        return conta.id === parseInt(req.query.numero_conta)
    })
    return res.json({ "saldo": idAcc.saldo })
}

const statement = (req, res) => {
    const fileContent = bancodedados
    const idAcc = contas.find((conta) => {
        return conta.id === parseInt(req.query.numero_conta)
    })

    const depositos = fileContent.depositos.filter((deposito) => {
        return parseInt(deposito.numero_conta) === idAcc.id
    })

    const saques = fileContent.saques.filter((saque) => {
        return parseInt(saque.numero_conta) === idAcc.id
    })

    const transferenciasEnviadas = fileContent.transferencias.filter((transferencia) => {
        return parseInt(transferencia.numero_conta_origem) === idAcc.id
    })

    const transferenciasRecebidas = fileContent.transferencias.filter((transferencia) => {
        return parseInt(transferencia.numero_conta_destino) === idAcc.id
    })

    const statement = {
        "depositos": depositos,
        "saques": saques,
        "transferenciasEnciadas": transferenciasEnviadas,
        "transferenciasRecebidas": transferenciasRecebidas
    }

    return res.json(statement)
};

module.exports = { listAcc, createAcc, updateAccUser, deleteAcc, deposit, withdraw, transfer, balance, statement }