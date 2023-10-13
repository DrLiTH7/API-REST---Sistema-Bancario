const bancodedados = require('../database/bancodedados.js')

const { contas } = bancodedados;


function thereIsBodyFields(req, res) {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    if (nome && cpf && data_nascimento && telefone && email && senha) {
        return
    } else {
        return res.status(400).json({ "mensagem": "Todos os campos devem ser informados" })
    }
}

function validID(req) {
    const idParams = contas.find((conta) => {
        return conta.id === parseInt(req.params.numeroConta)
    })
    return idParams
}



const verifyRequirements = (req, res, next) => {
    const { senha_banco } = req.query
    if (!senha_banco || senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ "mensagem": "A senha do banco informada é inválida!" })
    }
    next();
}

const accCreationRequirements = (req, res, next) => {
    if (contas.length > 0) {
        for (let conta of contas) {
            const { cpf, email } = conta
            if (cpf === req.body.cpf) {
                return res.status(400).json({ "mensagem": "O CPF informado já está cadastrado." })
            }
            else if (email === req.body.email) {
                return res.status(400).json({ "mensagem": "O e-mail informado já está cadastrado." })
            }
        }
    }
    thereIsBodyFields(req, res, next)
}

const updateAccRequirements = (req, res, next) => {
    thereIsBodyFields(req, res, next)
    const idParams = validID(req)
    if (idParams) {
        const othersAcc = contas.filter((conta) => {
            return conta.id !== parseInt(req.params.numeroConta)
        })
        const existCpf = othersAcc.find((acc) => {
            return acc.cpf === req.body.cpf
        })
        if (existCpf) {
            return res.status(400).json({ "mensagem": "O CPF informado já está cadastrado!" })
        } else {
            const existEmail = othersAcc.find((acc) => {
                return acc.email === req.body.email
            })
            if (existEmail) {
                return res.status(400).json({ "mensagem": "O e-mail informado já está cadastrado!" })
            } else {
                next()
            }
        }
    } else {
        return res.status(404).json({ "mensagem": "Conta inexistente" })
    }
}

const deleteRequirementes = (req, res, next) => {
    const idParams = validID(req)
    if (idParams) {
        if (!idParams.saldo) {
            next()
        } else {
            return res.status(400).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" })
        }
    } else {
        return res.status(404).json({ "mensagem": "Conta inexistente" })
    }

}

const depositRequirements = (req, res, next) => {
    if (req.body.numero_conta && req.body.valor) {
        const idParams = contas.find((conta) => {
            return conta.id === parseInt(req.body.numero_conta)
        })

        if (idParams) {
            if (req.body.valor > 0) {
                next()
            } else {
                return res.status(400).json({ "mensagem": "O valor depositado deve ser maior que 0." })
            }
        } else {
            return res.status(404).json({ "mensagem": "Esta conta não existe" })
        }
    } else {
        return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" })
    }
}

const withdrawRequirements = (req, res, next) => {
    if (req.body.numero_conta && req.body.valor && req.body.senha) {
        const idParams = contas.find((conta) => {
            return conta.id === parseInt(req.body.numero_conta)
        })
        if (idParams) {
            if (idParams.senha === req.body.senha) {
                if (req.body.valor > 0) {
                    next()
                } else {
                    return res.status(400).json({ "mensagem": "O valor depositado deve ser maior que 0." })
                }
            } else {
                return res.status(403).json({ "mensagem": "Senha incorreta" })
            }
        } else {
            return res.status(404).json({ "mensagem": "Esta conta não existe" })
        }
    } else {
        return res.status(400).json({ "mensagem": "O número da conta e o valor são obrigatórios!" })
    }
}

const transferRequirements = (req, res, next) => {
    if (req.body.numero_conta_origem && req.body.numero_conta_destino && req.body.valor && req.body.senha) {
        const idOrigin = contas.find((conta) => {
            return conta.id === parseInt(req.body.numero_conta_origem)
        })
        const idDestiny = contas.find((conta) => {
            return conta.id === parseInt(req.body.numero_conta_destino)
        })
        if (idOrigin && idDestiny) {
            if (req.body.senha === idOrigin.senha) {
                next()
            } else {
                return res.status(403).json({ "mensagem": "Senha inválida" })
            }
        } else {
            return res.status(404).json({ "mensagem": "Conta de origem ou conta de destino não encontradas" })
        }
    } else {
        return res.status(400).json({ "mensagem": "Preencha todos os dados no corpo da requisição." })
    }
}

const balanceStatementRequirements = (req, res, next) => {
    if (req.query.numero_conta && req.query.senha) {
        const idAcc = contas.find((conta) => {
            return conta.id === parseInt(req.query.numero_conta)
        })
        if (idAcc && req.query.senha === idAcc.senha) {
            next()
        } else {
            return res.status(403).json({ "mensagem": "Conta não encontrada ou senha incorreta" })
        }
    } else {
        return res.status(403).json({ "mensagem": "É necessário numero da conta e senha" })
    }
}

module.exports = { verifyRequirements, accCreationRequirements, updateAccRequirements, deleteRequirementes, depositRequirements, withdrawRequirements, transferRequirements, balanceStatementRequirements };