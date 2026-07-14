using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.Services;

public interface IProdutosService
{
    List<ProdutoResponseDTO> Listar();
    ProdutoResponseDTO BuscarPorId(int id);
    void Criar(CriarProdutoDTO produto);
    bool Atualizar(int id, CriarProdutoDTO produto);
    bool Remover(int id);
}

public class ProdutosService : IProdutosService
{
    private readonly IProdutosRepository _produtosRepository;

    public ProdutosService(IProdutosRepository produtosRepository)
    {
        _produtosRepository = produtosRepository;
    }

    public List<ProdutoResponseDTO> Listar()
    {
        var produtos = _produtosRepository.Listar();

        return produtos.Select(produto => new ProdutoResponseDTO
        {
            Id = produto.Id,
            Nome = produto.Nome,
            Tipo = produto.Tipo,
            Preco = produto.Preco,
            Estoque = produto.Estoque
        }).ToList();
    }

    public ProdutoResponseDTO BuscarPorId(int id)
    {
        var produto = _produtosRepository.BuscarPorId(id);
        if (produto == null)
        {
            return null;
        }

        return new ProdutoResponseDTO
        {
            Id = produto.Id,
            Nome = produto.Nome,
            Tipo = produto.Tipo,
            Preco = produto.Preco,
            Estoque = produto.Estoque
        };
    }

    public void Criar(CriarProdutoDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Nome))
            throw new Exception("Nome do produto é obrigatório");

        if (string.IsNullOrEmpty(dto.Tipo))
            throw new Exception("Tipo do produto é obrigatório");

        var novoProduto = new ProdutosEntitie
        {
            Nome = dto.Nome,
            Tipo = dto.Tipo,
            Preco = dto.Preco,
            Estoque = dto.Estoque
        };

        _produtosRepository.Adicionar(novoProduto);
    }

    public bool Atualizar(int id, CriarProdutoDTO dto)
    {
        var produtoExistente = _produtosRepository.BuscarPorId(id);
        if (produtoExistente == null)
        {
            return false;
        }
        produtoExistente.Nome = dto.Nome;
        produtoExistente.Tipo = dto.Tipo;
        produtoExistente.Preco = dto.Preco;
        produtoExistente.Estoque = dto.Estoque;

        _produtosRepository.Atualizar(produtoExistente);
        return true;
    }

    public bool Remover(int id)
    {
        var produto = _produtosRepository.BuscarPorId(id);
        if (produto == null)
        {
            return false;
        }
        _produtosRepository.Remover(id);
        return true;
    }

    public int GerarId()
    {
        var produtos = _produtosRepository.Listar();

        if (!produtos.Any())
            return 1;

        return produtos.Max(p => p.Id) + 1;
    }
}
