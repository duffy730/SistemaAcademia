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

public interface IPagamentoService
{
    List<PagamentoResponseDTO> listaPagamento();
    PagamentoResponseDTO BuscarPorId(int id);
    bool Criar(CriarPagamentoDTO pagamento);
    bool Atualizar(int id, CriarPagamentoDTO pagamento);
    bool Remover(int id);
}

public class PagamentoService : IPagamentoService
{
    private readonly IPagamentoRepository _pagamentoRepository;

    public PagamentoService(IPagamentoRepository pagamentoRepository)
    {
        _pagamentoRepository = pagamentoRepository;
    }

    public List<PagamentoResponseDTO> listaPagamento()
    {
        var pagamentos = _pagamentoRepository.Listar();
        return pagamentos.Select(pagamento => new PagamentoResponseDTO
        {
            Id = pagamento.Id,
            MatriculaId = pagamento.MatriculaId,
            Valor = pagamento.Valor,
            DataPagamento = pagamento.DataPagamento,
            Descricao = pagamento.Descricao,
            MetodoPagamento = pagamento.MetodoPagamento
        }).ToList();
    }

    public PagamentoResponseDTO BuscarPorId(int id)
    {
        var pagamento = _pagamentoRepository.BuscarPorId(id);
        if (pagamento == null)
        {
            return null;
        }
        return new PagamentoResponseDTO
        {
            Id = pagamento.Id,
            Valor = pagamento.Valor,
            DataPagamento = pagamento.DataPagamento,
            Descricao = pagamento.Descricao
        };
    }

    public bool Criar(CriarPagamentoDTO dto)
    {
        if (dto.MatriculaId <= 0)
        {
            return false;
        }
        
        var novoPagamento = new PagamentoEntitie
        {
            MatriculaId = dto.MatriculaId,
            Valor = dto.Valor,
            MetodoPagamento = dto.MetodoPagamento,
            DataPagamento = DateOnly.FromDateTime(DateTime.Now),
            Descricao = dto.Descricao
        };
        _pagamentoRepository.Adicionar(novoPagamento);
        return true;
    }

    public bool Atualizar(int id, CriarPagamentoDTO dto)
    {
        var pagamentoExistente = _pagamentoRepository.BuscarPorId(id);
        if (pagamentoExistente == null)
        {
            return false;
        }

        pagamentoExistente.MatriculaId = dto.MatriculaId;
        pagamentoExistente.Valor = dto.Valor;
        pagamentoExistente.MetodoPagamento = dto.MetodoPagamento;
        pagamentoExistente.DataPagamento = DateOnly.FromDateTime(DateTime.Now);
        pagamentoExistente.Descricao = dto.Descricao;

        _pagamentoRepository.Atualizar(pagamentoExistente);
        return true;
    }

    public bool Remover(int id)
    {
        var pagamento = _pagamentoRepository.BuscarPorId(id);
        if (pagamento == null)
        {
            return false;
        }
        _pagamentoRepository.Remover(id);

        return true;
    }

    public int GerarId()
    {
        var pagamento = _pagamentoRepository.Listar();

        if (!pagamento.Any())
            return 1;

        return pagamento.Max(a => a.Id) + 1;
    }
}
