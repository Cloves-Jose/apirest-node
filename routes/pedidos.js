const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool

//Listando todos os pedidos
router.get('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            `SELECT tb_pedidos.id_pedido,
                    tb_pedidos.quantidade,
                    tb_produto.id_produto,
                    tb_produto.nome,
                    tb_produto.preco
               FROM tb_pedidos
         INNER JOIN tb_produto
                 ON tb_produto.id_produto = tb_pedidos.id_produto`,
            (error, result, field) => {
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    pedidos: result.map(pedido => {
                        return {
                            id_pedido: pedido.id_pedido,
                            quantidade: pedido.preco,
                            produto: {
                                id_produto: pedido.id_produto,
                                nome: pedido.nome,
                                preco: pedido.preco
                            },
                           
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de um pedido específico',
                                url: 'http://localhost:3000/pedidos/' + pedido.id_pedido
                            }
                        }
                    })
                }
                return res.status(200).send(response);
            }
        )
    })
});

//Criando um novo pedido
router.post('/', (req, res, next) => {

    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({error: error})}
        conn.query('SELECT * FROM tb_produto WHERE id_produto = ?', 
        [req.body.id_produto], 
        (error, result, field) => {
            if (error) { return res.status(500).send({error: error})}
            if (result.length == 0) {
                return res.status(404).send({
                    mensagem: 'Não foi encontrado produto com este ID'
                })
            } 
            conn.query(
                'INSERT INTO tb_pedidos (id_produto, quantidade) VALUES (?,?)',
                [req.body.id_produto, req.body.quantidade],
                (error, result, field) => {
                    conn.release();
                    if(error) {return res.status(500).send({error: error})}
                    const response = {
                        mensagem: 'Pedido inserido com sucesso',
                        pedidoCriado: {
                            id_pedido: result.id_pedido,
                            id_produto: req.body.id_produto,
                            quantidade: req.body.quantidade,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna todos os pedidos',
                                url: 'http://localhost:3000/pedidos'
                            }
                        }
                    }
                    return res.status(201).send(response);
                }
            )
        })
    });
});

//Puxando um pedido pelo ID
router.get('/:id_pedido', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) {return res.status(500).send({error: error})}
        conn.query(
            'SELECT * FROM tb_pedidos WHERE id_pedido = ?;',
            [req.params.id_pedido],
            (error, result, field) => {
                if(error) { return res.status(500).send({error: error})}
                if(result.length == 0){
                    return res.status(404).send({
                        mensagem: 'Não foi encontrado pedido com este ID'
                    })
                }
                const response = {
                    pedido: {
                        id_pedido: result[0].id_pedido,
                        id_produto: result[0].id_produto,
                        quantidade: result[0].quantidade,
                        request: {
                            tipo: 'GET',
                            descricao: 'Retorna todos os pedidos',
                            url: 'http://localhost:3000/pedidos'
                        }
                    }
                }
                return res.status(200).send(response);
            }
        )
    });
});

//Deletando um pedido
router.delete('/', (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if (error) {return res.status(500).send({error: error})}
        conn.query(
            `DELETE FROM tb_pedidos WHERE id_pedido = ?`, [req.body.id_pedido],
            (error, result, field) => {
                conn.release();
                if(error) {return res.status(500).send({error: error})}
                const response = {
                    mensagem: 'Pedido removido com sucesso',
                    request: {
                        tipo: 'POST',
                        descricao: 'Insere um pedido',
                        url: 'http://localhost:3000/pedidos',
                        body: {
                            id_produto: 'Number',
                            preco: 'Number'
                        }
                    }
                }
                res.status(202).send(response);
            }
        )
    });
})

module.exports = router