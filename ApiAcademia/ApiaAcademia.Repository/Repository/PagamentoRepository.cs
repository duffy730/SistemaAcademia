using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IPagamentoRepository
{
    List<PagamentoEntitie> Listar();
    PagamentoEntitie BuscarPorId(int Id);
    void Adicionar(PagamentoEntitie pagamento);
    void Atualizar(PagamentoEntitie pagamento);
    void Remover(int Id);

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

    public void Adicionar(PagamentoEntitie pagamento)
    {
        _context.Pagamentos.Add(pagamento);

        _context.SaveChanges();
    }

    public void Atualizar(PagamentoEntitie pagamento)
    {
        var pagamentoExistente = BuscarPorId(pagamento.Id);
        if (pagamentoExistente != null)
        {
            pagamentoExistente.Valor = pagamento.Valor;
            pagamentoExistente.DataPagamento = pagamento.DataPagamento;
            pagamentoExistente.MetodoPagamento = pagamento.MetodoPagamento;
            _context.SaveChanges();
        }
    }

    public void Remover(int id)
    {
        var pagamento = BuscarPorId(id);

        if (pagamento != null)
        {
            _context.Pagamentos.Remove(pagamento);
            _context.SaveChanges();
        }
    }
}
