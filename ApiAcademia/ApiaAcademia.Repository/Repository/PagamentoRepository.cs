using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Repository.Repository;

public interface IPagamentoRepository
{
    List<PagamentoEntitie> Listar();
    PagamentoEntitie BuscarPorId(int Id);

    bool AdicionarComBaixaEstoque(PagamentoEntitie pagamento);
    bool AtualizarComAjusteEstoque(
        int id,
        PagamentoEntitie novosDados
    );
    bool RemoverComDevolucaoEstoque(int id);
    bool ExistePagamentoPendente(int matriculaId);
    bool QuitarPagamentoPendente(
    int matriculaId,
    string metodoPagamento,
    DateOnly dataPagamento
    );
}
public class PagamentoRepository : IPagamentoRepository
{
    private readonly AppDbContext _context;

    public PagamentoRepository(AppDbContext context)
    {
        _context = context;
    }

    public PagamentoEntitie BuscarPorId(int id)
    {
        return _context.Pagamentos.FirstOrDefault(x => x.Id == id);
    }

    public List<PagamentoEntitie> Listar()
    {
        return _context.Pagamentos.ToList();
    }

    public bool AdicionarComBaixaEstoque(
        PagamentoEntitie pagamento
    )
    {
        using var transaction =
            _context.Database.BeginTransaction();

        try
        {
            if (pagamento.ProdutoId.HasValue)
            {
                var produto = _context.Produtos.FirstOrDefault(
                    produto =>
                        produto.Id == pagamento.ProdutoId.Value
                );

                if (produto == null)
                {
                    transaction.Rollback();
                    return false;
                }

                if (pagamento.Quantidade <= 0)
                {
                    transaction.Rollback();
                    return false;
                }

                if (produto.Estoque < pagamento.Quantidade)
                {
                    transaction.Rollback();
                    return false;
                }

                produto.Estoque -= pagamento.Quantidade;

                // Não confie no preço enviado pelo React.
                pagamento.Valor =
                    produto.Preco * pagamento.Quantidade;
            }
            else
            {
                pagamento.Quantidade = 0;
            }

            _context.Pagamentos.Add(pagamento);
            _context.SaveChanges();

            transaction.Commit();

            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public bool AtualizarComAjusteEstoque(
        int id,
        PagamentoEntitie novosDados
    )
    {
        using var transaction =
            _context.Database.BeginTransaction();

        try
        {
            var pagamentoAtual =
                _context.Pagamentos.FirstOrDefault(
                    pagamento => pagamento.Id == id
                );

            if (pagamentoAtual == null)
            {
                transaction.Rollback();
                return false;
            }

            // Devolve ao estoque a venda antiga.
            if (pagamentoAtual.ProdutoId.HasValue)
            {
                var produtoAntigo =
                    _context.Produtos.FirstOrDefault(
                        produto =>
                            produto.Id ==
                            pagamentoAtual.ProdutoId.Value
                    );

                if (produtoAntigo != null)
                {
                    produtoAntigo.Estoque +=
                        pagamentoAtual.Quantidade;
                }
            }

            decimal valorFinal = novosDados.Valor;

            // Aplica a nova venda.
            if (novosDados.ProdutoId.HasValue)
            {
                var produtoNovo =
                    _context.Produtos.FirstOrDefault(
                        produto =>
                            produto.Id ==
                            novosDados.ProdutoId.Value
                    );

                if (
                    produtoNovo == null ||
                    novosDados.Quantidade <= 0 ||
                    produtoNovo.Estoque <
                        novosDados.Quantidade
                )
                {
                    transaction.Rollback();
                    return false;
                }

                produtoNovo.Estoque -=
                    novosDados.Quantidade;

                valorFinal =
                    produtoNovo.Preco *
                    novosDados.Quantidade;
            }
            else
            {
                novosDados.Quantidade = 0;
            }

            pagamentoAtual.MatriculaId =
                novosDados.MatriculaId;

            pagamentoAtual.ProdutoId =
                novosDados.ProdutoId;

            pagamentoAtual.Quantidade =
                novosDados.Quantidade;

            pagamentoAtual.Valor = valorFinal;

            pagamentoAtual.MetodoPagamento =
                novosDados.MetodoPagamento;

            pagamentoAtual.DataPagamento =
                novosDados.DataPagamento;

            _context.SaveChanges();
            transaction.Commit();

            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public bool RemoverComDevolucaoEstoque(int id)
    {
        using var transaction =
            _context.Database.BeginTransaction();

        try
        {
            var pagamento =
                _context.Pagamentos.FirstOrDefault(
                    pagamento => pagamento.Id == id
                );

            if (pagamento == null)
            {
                transaction.Rollback();
                return false;
            }

            if (pagamento.ProdutoId.HasValue)
            {
                var produto =
                    _context.Produtos.FirstOrDefault(
                        produto =>
                            produto.Id ==
                            pagamento.ProdutoId.Value
                    );

                if (produto != null)
                {
                    produto.Estoque += pagamento.Quantidade;
                }
            }

            _context.Pagamentos.Remove(pagamento);
            _context.SaveChanges();

            transaction.Commit();

            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public bool ExistePagamentoPendente(int matriculaId)
    {
        return _context.Pagamentos.Any(
            pagamento =>
                pagamento.MatriculaId == matriculaId &&
                pagamento.Status.ToLower() == "pendente"
        );
    }

    public bool QuitarPagamentoPendente(
    int matriculaId,
    string metodoPagamento,
    DateOnly dataPagamento)
    {
        var pagamentoPendente =
            _context.Pagamentos.FirstOrDefault(
                pagamento =>
                    pagamento.MatriculaId == matriculaId &&
                    pagamento.ProdutoId == null &&
                    pagamento.Status == "Pendente"
            );

        if (pagamentoPendente == null)
        {
            return false;
        }

        pagamentoPendente.Status = "Pago";

        pagamentoPendente.MetodoPagamento =
            metodoPagamento;

        pagamentoPendente.DataPagamento =
            dataPagamento;

        if (
            pagamentoPendente.Descricao.StartsWith(
                "Mensalidade pendente -"
            )
        )
        {
            pagamentoPendente.Descricao =
                pagamentoPendente.Descricao.Replace(
                    "Mensalidade pendente -",
                    "Pagamento do"
                );
        }

        _context.SaveChanges();

        return true;
    }
}
