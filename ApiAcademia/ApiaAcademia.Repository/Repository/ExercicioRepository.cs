using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IExercicioRepository
{
    List<ExercicioEntitie> Listar();
    ExercicioEntitie BuscarPorId(int Id);
    void Adicionar(ExercicioEntitie exercicio);
    void Atualizar(ExercicioEntitie exercicio);
    void Remover(int Id);
}

public class ExercicioRepository : IExercicioRepository
{
    private readonly AppDbContext _context;

    public ExercicioRepository(AppDbContext context)
    {
        _context = context;
    }

    public ExercicioEntitie BuscarPorId(int id)
    {
        return _context.Exercicio.FirstOrDefault(x => x.Id == id);
    }

    public List<ExercicioEntitie> Listar()
    {
        return _context.Exercicio.ToList();
    }

    public void Adicionar(ExercicioEntitie exercicio)
    {
        _context.Exercicio.Add(exercicio);
        _context.SaveChanges();
    }

    public void Atualizar(ExercicioEntitie exercicio)
    {
        var exercicioExistente = BuscarPorId(exercicio.Id);
        if (exercicioExistente != null)
        {
            exercicioExistente.Nome = exercicio.Nome;
            exercicioExistente.MusculoPrin = exercicio.MusculoPrin;
            _context.SaveChanges();
        }
    }

    public void Remover(int id)
    {
        var exercicio = BuscarPorId(id);

        if (exercicio != null)
        {
            _context.Exercicio.Remove(exercicio);

            _context.SaveChanges();
        }
    }
}
