using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IProdutosRepository
{
    List<ProdutosEntitie> Listar();
    ProdutosEntitie BuscarPorId(int Id);
    void Adicionar(ProdutosEntitie produto);
    void Atualizar(ProdutosEntitie produto);
    void Remover(int Id);
}
public class ProdutosRepository : IProdutosRepository
{

    private readonly AppDbContext _context;

    public ProdutosRepository(AppDbContext context)
    {
        _context = context;
    }

    public ProdutosEntitie BuscarPorId(int id)
    {
        return _context.Produtos.FirstOrDefault(x => x.Id == id);
    }

    public List<ProdutosEntitie> Listar()
    {
        return _context.Produtos.ToList();
    }

    public void Adicionar(ProdutosEntitie produto)
    {
        _context.Produtos.Add(produto);
        _context.SaveChanges();
    }

    public void Atualizar(ProdutosEntitie produto)
    {
        var produtoExistente = BuscarPorId(produto.Id);
        if (produtoExistente != null)
        {
            produtoExistente.Nome = produto.Nome;
            produtoExistente.Preco = produto.Preco;
            produtoExistente.Tipo = produto.Tipo;
            produtoExistente.Estoque = produto.Estoque;
            _context.SaveChanges();
        }
    }

    public void Remover(int id)
    {
        var produto = BuscarPorId(id);

        if (produto != null)
        {
            _context.Produtos.Remove(produto);
            _context.SaveChanges();
        }
    }
}
