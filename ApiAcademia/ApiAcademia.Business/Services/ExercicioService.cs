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

public interface IExercicioService
{
    List<ExercicioResponseDTO> Listar();
    ExercicioResponseDTO BuscarPorId(int id);
    void Criar(CriarExercicioDTO exercicio);
    bool Atualizar(int id, CriarExercicioDTO exercicio);
    bool Remover(int id);
}

public class ExercicioService : IExercicioService
{

    private readonly IExercicioRepository _ExercicioRepository;

    public ExercicioService(IExercicioRepository ExercicioRepository)
    {
        _ExercicioRepository = ExercicioRepository;
    }

    public List<ExercicioResponseDTO> Listar()
    {
        var Exercicios = _ExercicioRepository.Listar();

        return Exercicios.Select(Exercicio => new ExercicioResponseDTO
        {
            Id = Exercicio.Id,
            Nome = Exercicio.Nome,
            MusculoPrin = Exercicio.MusculoPrin,
            Descanso = Exercicio.Descanso,
            Reps = Exercicio.Reps,
            Series = Exercicio.Series
        }).ToList();
    }

    public ExercicioResponseDTO BuscarPorId(int id)
    {
        var Exercicio = _ExercicioRepository.BuscarPorId(id);
        if (Exercicio == null)
        {
            return null;
        }

        return new ExercicioResponseDTO
        {
            Id = Exercicio.Id,
            Nome = Exercicio.Nome,
            MusculoPrin = Exercicio.MusculoPrin,
            Descanso = Exercicio.Descanso,
            Reps = Exercicio.Reps,
            Series = Exercicio.Series
        };
    }

    public void Criar(CriarExercicioDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Nome))
            throw new Exception("Nome do Exercicio é obrigatório");

        if (string.IsNullOrEmpty(dto.MusculoPrin))
            throw new Exception("Músculo principal do Exercicio é obrigatório");

        var novoExercicio = new ExercicioEntitie
        {
            Nome = dto.Nome,
            MusculoPrin = dto.MusculoPrin,
            Descanso = dto.Descanso,
            Reps = dto.Reps,
            Series = dto.Series
        };

        _ExercicioRepository.Adicionar(novoExercicio);
    }

    public bool Atualizar(int id, CriarExercicioDTO dto)
    {
        var ExercicioExistente = _ExercicioRepository.BuscarPorId(id);
        if (ExercicioExistente == null)
        {
            return false;
        }
        ExercicioExistente.Nome = dto.Nome;
        ExercicioExistente.MusculoPrin = dto.MusculoPrin;

        _ExercicioRepository.Atualizar(ExercicioExistente);
        return true;
    }

    public bool Remover(int id)
    {
        var Exercicio = _ExercicioRepository.BuscarPorId(id);
        if (Exercicio == null)
        {
            return false;
        }
        _ExercicioRepository.Remover(id);

        return true;
    }

    public int GerarId()
    {
        var Exercicios = _ExercicioRepository.Listar();

        if (!Exercicios.Any())
            return 1;

        return Exercicios.Max(a => a.Id) + 1;
    }
}