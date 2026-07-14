using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Repository;
using System.Numerics;

namespace ApiAcademia.Business.Services;

public interface IPlanoService
{
    List<PlanoResponseDTO> listaPlano();

    PlanoResponseDTO BuscarPorId(int id);

    bool Criar(CriarPlanoDTO dto);

    bool Remover(int id);
}

public class PlanoService : IPlanoService
{
    private readonly IPlanoRepository _planoRepository;

    public PlanoService(IPlanoRepository planoRepository)
    {
        _planoRepository = planoRepository;
    }

    public List<PlanoResponseDTO> listaPlano()
    {
        var planos = _planoRepository.Listar();

        return planos.Select(plano => new PlanoResponseDTO
        {
            Id = plano.Id,
            Nome = plano.Nome,
            Valor = plano.Valor,
            DuracaoDias = plano.DuracaoDias,
            Descricao = plano.Descricao
        }).ToList();
    }

    public PlanoResponseDTO BuscarPorId(int id)
    {
        var plano = _planoRepository.BuscarPorId(id);

        if (plano == null)
        {
            return null;
        }

        return new PlanoResponseDTO
        {
            Id = plano.Id,
            Nome = plano.Nome,
            Valor = plano.Valor,
            DuracaoDias = plano.DuracaoDias,
            Descricao = plano.Descricao
        };
    }

    public bool Criar(CriarPlanoDTO dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome))
            return false;

        var novoPlano = new PlanoEntitie
        {
            Nome = dto.Nome,
            Valor = dto.Valor,
            DuracaoDias = dto.DuracaoDias,
            Descricao = $"Plano de {dto.DuracaoDias} dias"
        };

        _planoRepository.Adicionar(novoPlano);

        return true;
    }

    public bool Remover(int id)
    {
        var plano = _planoRepository.BuscarPorId(id);

        if (plano == null)
            return false;

        _planoRepository.Remover(id);
        return true;
    }

    private int GerarId()
    {
        var planos = _planoRepository.Listar();

        if (!planos.Any())
            return 1;

        return planos.Max(x => x.Id) + 1;
    }
}