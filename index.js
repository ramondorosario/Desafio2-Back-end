const koa = require('koa');
const server = new koa ();

const bodyParser = require('koa-bodyparser');
server.use(bodyParser());


/**Formata a mensagem de sucesso*/
const formatarSucesso = (ctx, status, mensagem, acao, resultado ) => {
    ctx.status = status;
    ctx.body = {
        status: 'sucesso',
        dados: {
            'mensagem': mensagem,
            [acao]: resultado
        }
    }
}

/**Formata a mensagem de erro*/
const formatarErro = (ctx, status, mensagem) => {
    ctx.status = status;
    ctx.body = {
        status: 'erro',
        dados: {
            'mensagem': mensagem
        }
    }
}

/**Encontra o indice através da url*/
const encontrarIndice = (ctx) => {
    const id = ctx.url.split('/')[2];
    if(!id) return formatarErro(ctx, 400, 'id precisa ser informada');
    return id;
}

//------------Funções relacionadas aos produtos------------
const produtos = [];
/**Cria um novo produto*/
const criarNovoProduto = (ctx) => {
    //Verifica se já existe um produto com a id informada
    const conteudoProduto = ctx.request.body;
    if(!conteudoProduto.id || !conteudoProduto.nome || !conteudoProduto.quantidade || !conteudoProduto.valor)
    return formatarErro(ctx, 400, 'id, nome, quantidade e valor do produto são obrigatórios');
    const produtoExiste = produtos.filter(x => x.id == ctx.request.body.id);

    if(!produtoExiste.length) { 
        if(conteudoProduto.deletado === undefined) conteudoProduto.deletado = false;
        produtos.push(conteudoProduto);
        formatarSucesso(ctx, 201, 'produto criado com sucesso', 'produto', conteudoProduto);
    } else {
        formatarErro(ctx, 401, 'já existe um produto com a id informada');
    }
}

/**Exibe um produto em específico*/
const exibirUmProduto = (ctx) => {
    const idProduto = encontrarIndice(ctx);
    
    const produtoEncontrado = produtos.filter(x => x.id == idProduto);
    if(produtoEncontrado[0]) formatarSucesso(ctx, 200, 'produto encontrado', 'produto', produtoEncontrado[0]) ;
    else formatarErro(ctx, 404, 'produto não encontrado');
}

/**Exibe todos os produtos*/
const exibirTodosOsProdutos = (ctx) => {
    if (produtos.length !== 0) formatarSucesso(ctx, 200, 'lista de produtos encontrada', 'produtos', produtos); 
    else formatarErro(ctx, 404, 'não existe nenhuma lista de produtos');
}

/**Atualiza um produto*/
const atualizarProduto = (ctx) => {
    const idProduto = encontrarIndice(ctx);
    const produtoExiste = produtos.filter(x => x.id == idProduto);

    if(produtoExiste.length) {
        if(!produtoExiste[0].deletado) {
            const indiceProduto = produtos.indexOf(produtoExiste[0]);
            const propriedades = ctx.request.body;

            if(propriedades.id || propriedades.id === '') return formatarErro(ctx, 401, 'id não pode ser atualizado');
            if(propriedades.deletado) return formatarErro(ctx, 401, 'deletado não pode ser atualizado');
            if(propriedades.nome === '' || propriedades.quantidade === '' || propriedades.valor === '') formatarErro(ctx, 400, 'informações mal formatada')
            if(propriedades.nome) {
                produtos[indiceProduto].nome = propriedades.nome;
                formatarSucesso(ctx, 200, 'produto foi atualizado', 'produto', produtos[indiceProduto]);
            }
            if(propriedades.quantidade || propriedades.quantidade === 0) {
                produtos[indiceProduto].quantidade = propriedades.quantidade;
                formatarSucesso(ctx, 200, 'produto foi atualizado', 'produto', produtos[indiceProduto]);
            }
            if(propriedades.valor) {
                produtos[indiceProduto].valor = propriedades.valor;
                formatarSucesso(ctx, 200, 'produto foi atualizado', 'produto', produtos[indiceProduto]);
            }
        } else formatarErro(ctx, 401, 'produto encontra-se deletado');
    } else formatarErro(ctx, 404, 'produto não encontrado');
}

/**Deleta um produto*/
const deletarProduto = (ctx) => {
    const idProduto = encontrarIndice(ctx);
    const produtoExiste = produtos.filter(x => x.id == idProduto);

    if(produtoExiste.length) {
        if(produtoExiste[0].deletado === false) {
            const indice = produtos.indexOf(produtoExiste[0]);
            produtos[indice].deletado = true;
            formatarSucesso(ctx, 200, 'produto deletado', 'produto', produtos[indice]);
        } else formatarErro(ctx, 401, 'produto já se encontra deletado');
    } else formatarErro(ctx, 404, 'produto não encontrado');
}

//---------------Funções relacionadas aos pedidos---------------
const listaDePedidos = [];
let contId = 1;
/**Cria um novo pedido*/
const registrarNovoPedido = (ctx) => {
    const idCliente = ctx.request.body.idCliente;

    const clienteExiste = listaDePedidos.filter(x => x.idCliente == idCliente);
    if(clienteExiste[0]) return formatarErro(ctx, 401, 'já existe um pedido registrado com id informada');

    const pedido = {
        id: contId,
        idCliente: idCliente,
        estado: 'incompleto',
        produtos: [],
        deletado: false,
        valorTotal: 0
    }
    contId++;

    if(idCliente) {
        listaDePedidos.push(pedido);
        const indice = listaDePedidos.indexOf(pedido);
        formatarSucesso(ctx, 201, 'pedido registrado', 'pedido', listaDePedidos[indice]);        
    } else formatarErro(ctx, 400, 'id do cliente deve ser informado');
}

/**Obtem informações de um pedido em particular*/
const exibirPedido = (ctx) => {
    const idPedido = encontrarIndice(ctx);
    const pedidoEncontrado = listaDePedidos.filter(x => x.id == idPedido);

    if(pedidoEncontrado[0]) formatarSucesso(ctx, 200, 'pedido encontrado', 'pedido', pedidoEncontrado[0]) ;
    else formatarErro(ctx, 404, 'pedido não encontrado');
}

/**Exibe toda lista de pedidos*/
const exibirTodosPedidos = (ctx) => {
    if(!listaDePedidos.length) return formatarErro(ctx, 404, 'não existe nenhum pedido registrado');

    const listaDePedidosNaoDeletado = listaDePedidos.filter(x => x.deletado === false);
    formatarSucesso(ctx, 200, 'lista de pedidos encontrada', 'pedidos', listaDePedidosNaoDeletado);    
}

/**Exibi toda lista de pedido em um estado em particular*/
const exibirPedidosEspecifico = (ctx) => {
    const estadoInformado = ctx.url.split('=')[1];
    if(!estadoInformado) return formatarErro(ctx, 404, 'estado do pedido não encontrado');
    if (estadoInformado === 'incompleto') {
        buscaEstadoPedido(ctx, 'incompleto');
    } else if (estadoInformado === 'processando') {
        buscaEstadoPedido(ctx, 'processando');
    } else if (estadoInformado === 'pagos') {
        buscaEstadoPedido(ctx, 'pagos');
    } else if (estadoInformado === 'entregues') {
        buscaEstadoPedido(ctx, 'entregues');
    } else if (estadoInformado === 'cancelados') {
        buscaEstadoPedido(ctx, 'cancelados');
    } else if (estadoInformado.length > 0) {
        formatarErro(ctx, 401, 'estado inválido');
    } else {
        formatarErro(ctx, 404, 'estado do pedido não informado');
    }
}

/**Função auxiliar da funcão de busca de pedidos em um estado em particular*/
const buscaEstadoPedido = (ctx, Estado) => {    
    const pedidosEstado = listaDePedidos.filter(x => x.estado === Estado && x.deletado === false);
    formatarSucesso(ctx, 200, `lista de pedidos ${Estado} encontrada`, 'pedidos', pedidosEstado);
}

/**Atualiza o pedido*/
const atualizarPedido = (ctx) => {
    const idPedido = encontrarIndice(ctx);
    const temPedido = listaDePedidos.filter(x => x.id == idPedido);
    if(!temPedido[0]) return formatarErro(ctx, 404, 'pedido não encontrado');

    const conteudo = ctx.request.body;
    if(conteudo.estado) {
        atualizarEstadoDoPedido(ctx, temPedido[0])
    } else if (conteudo.id ) {
        if (conteudo.quantidade === 0) {
            adicionarProdutoNaListaDePedido(ctx, temPedido[0]);
        } else if (conteudo.quantidade > 0) {
            adicionarProdutoNaListaDePedido(ctx, temPedido[0]);
        } else formatarErro(ctx, 400, 'quantidade do produto mal formatada');
    } else formatarErro(ctx, 400, 'informações mal formatada');
}

/**Atualiza o estado de um pedido*/
const atualizarEstadoDoPedido = (ctx, pedido) => {
    const valorDoEstado = ctx.request.body.estado;    
    const indice = listaDePedidos.indexOf(pedido);

    if (listaDePedidos[indice].produtos.length === 0) return formatarErro(ctx, 401, 'estado do pedido não pode ser alterado. Lista de produtos do pedido está vazia');
    listaDePedidos[indice].estado = valorDoEstado;
    if (listaDePedidos[indice].deletado === true) return formatarErro(ctx, 401, 'pedido foi deletado')
    formatarSucesso(ctx, 200, 'estado do pedido foi atualizado', 'pedido', listaDePedidos[indice]);
}

/**Adiciona um produto na lista de produtos de um pedido em particular*/
const adicionarProdutoNaListaDePedido = (ctx, pedido) => {
    const conteudo = ctx.request.body;
    const idProduto = conteudo.id;
    const quantidadePedida = conteudo.quantidade;

    const temProduto = produtos.filter(x => x.id == idProduto);
    if(!temProduto[0]) formatarErro(ctx, 404, 'produto não encontrado');
    else {
        const indiceProduto = produtos.indexOf(temProduto[0]);
        const indicePedido = listaDePedidos.indexOf(pedido);

        if (listaDePedidos[indicePedido].estado !== 'incompleto') formatarErro(ctx, 401, 'estado do pedido deixou de ser incompleto');
        else if (listaDePedidos[indicePedido].deletado === true) return formatarErro(ctx, 401, 'pedido foi deletado');
        else if (produtos[indiceProduto].deletado === true || produtos[indiceProduto].quantidade === 0) formatarErro(ctx, 401, 'produto indisponível');
        else if (produtos[indiceProduto].quantidade < quantidadePedida) formatarErro(ctx, 401, `quantidade solicitada superior ao estoque [disponível: ${produtos[indiceProduto].quantidade}]`);
        else {
            const resposta = verificarProdutosJaAdicionados(indicePedido, idProduto);
            // Se não existir o produto na lista ele será adicionado
            if (!resposta) {
                if (conteudo.quantidade === 0) return formatarErro(ctx, 404, 'quantidade do produto não informado')
                const produtoASerAdicionado = {
                    id: idProduto,
                    nome: produtos[indiceProduto].nome,
                    quantidade: quantidadePedida,
                    valor: produtos[indiceProduto].valor,
                    subtotal: quantidadePedida * produtos[indiceProduto].valor,
                    deletado: produtos[indiceProduto].deletado
                }
                produtos[indiceProduto].quantidade -= quantidadePedida;          
                listaDePedidos[indicePedido].produtos.push(produtoASerAdicionado);
                calcularTotalDoPedido(indicePedido);   
                formatarSucesso(ctx, 200, `produto adicionado no pedido de id: ${listaDePedidos[indicePedido].id}`, 'produto', produtoASerAdicionado);
            
            // Se já existir o produto na lista, a quantidade do produto será alterada 
            } else {
                const produtoRepetido = listaDePedidos[indicePedido].produtos.filter(x => x.id === idProduto);
                const indiceProdutoRepetido = listaDePedidos[indicePedido].produtos.indexOf(produtoRepetido[0]);

                const produto = listaDePedidos[indicePedido].produtos[indiceProdutoRepetido];

                produtos[indiceProduto].quantidade += produto.quantidade;

                produto.quantidade = quantidadePedida;
                // Se a quantidade do produto informado for 0, o produto será deletado
                if(produto.quantidade === 0) {
                        listaDePedidos[indicePedido].produtos.splice(indiceProduto, 1);
                    produto.subtotal = produto.valor * quantidadePedida;
                    produto.deletado = true;
                    calcularTotalDoPedido(indicePedido);
                    return formatarSucesso(ctx, 200, 'produto removido da lista de produtos do pedido', 'produto', produto);
                }
                produto.subtotal = produto.valor * quantidadePedida;

                const produtoAtualizado = listaDePedidos[indicePedido].produtos[indiceProdutoRepetido];
                produtos[indiceProduto].quantidade -= quantidadePedida;
                calcularTotalDoPedido(indicePedido);

                formatarSucesso(ctx, 200, 'quantidade do produto foi alterada', 'produto', produtoAtualizado);
            }
        }
    }
}

/**Verifica se já existe um produto adicionado na lista de produtos de um pedido*/
const verificarProdutosJaAdicionados = (indicePedido, idProduto) => {
    const produtoRepetido = listaDePedidos[indicePedido].produtos.filter(x => x.id === idProduto);
    if(produtoRepetido.length) return true;
    return false;
}

/**Deleta um pedido*/
const deletarPedido = (ctx) => {
    const idPedido = Number(encontrarIndice(ctx));
    const temPedido = listaDePedidos.filter(x => x.id === idPedido);
    if(!temPedido[0]) return formatarErro(ctx, 404, 'pedido não encontrado');
    const indicePedido = listaDePedidos.indexOf(temPedido[0]);
    
    if (listaDePedidos[indicePedido].deletado === true) return formatarErro(ctx, 401, 'pedido já foi deletado');
    listaDePedidos[indicePedido].deletado = true; 
    calcularTotalDoPedido(indicePedido);
    formatarSucesso(ctx, 200, 'pedido foi deletado', 'pedido', listaDePedidos[indicePedido]);
}

/**Calcula o valor total do pedido*/
const calcularTotalDoPedido = (indicePedido) => {
    const pedido = listaDePedidos[indicePedido].produtos;
    let valorTotal = 0;
    pedido.forEach(x => {
        valorTotal += x.subtotal;
        listaDePedidos[indicePedido].valorTotal = valorTotal; 
    })
}  

//-------------Servidor---------------
server.use((ctx) => {
    if(ctx.method === 'POST') {
        if (ctx.url === '/products') criarNovoProduto(ctx); 
        else if (ctx.url === '/orders') registrarNovoPedido(ctx);
        else formatarErro(ctx, 404, 'caminho inválido');
    } else if(ctx.method === 'GET') {
        if (ctx.url.includes('/products/')) exibirUmProduto(ctx);
        else if (ctx.url === '/products') exibirTodosOsProdutos(ctx);
        else if (ctx.url.includes('/orders/')) exibirPedido(ctx);
        else if (ctx.url === '/orders') exibirTodosPedidos(ctx);
        else if (ctx.url.includes('/orders?state=')) exibirPedidosEspecifico(ctx);
        else formatarErro(ctx, 404, 'caminho inválido');
    } else if (ctx.method === 'PUT') {
        if (ctx.url.includes('/products/')) atualizarProduto(ctx);
        else if (ctx.url.includes('/orders/')) atualizarPedido(ctx);
        else formatarErro(ctx, 400, 'caminho mal formatado');
    } else if (ctx.method === 'DELETE') {
        if (ctx.url.includes('/products/')) deletarProduto(ctx);
        else if (ctx.url.includes('/orders/')) deletarPedido(ctx);
        else formatarErro(ctx, 400, 'caminho inválido');
    } else {
        formatarErro(ctx, 405, 'metodo não permitido');
    }
})

server.listen('8081', () => {
    console.log('Servidor rodando na porta 8081')
})