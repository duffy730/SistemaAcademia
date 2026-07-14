using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IMatriculaRepository
{
    List<MatriculaEntitie> Listar();
    MatriculaEntitie BuscarPorId(int Id);
    void Adicionar(MatriculaEntitie matricula);
    void Atualizar(MatriculaEntitie matricula);
    void Ativar(int id);
    void Desativar(int id);
    void Remover(int id);

}

public class MatriculaRepository : IMatriculaRepository
{
    private readonly AppDbContext _context;

    public MatriculaRepository(AppDbContext context)
    {
        _context = context;
    }

    public MatriculaEntitie BuscarPorId(int id)
    {
        return _context.Matriculas
        .Include(m => m.Aluno)
        .Include(m => m.Plano)
        .FirstOrDefault(m => m.Id == id);
    }

    public List<MatriculaEntitie> Listar()
    {
        return _context.Matriculas
            .Include(m => m.Aluno)
            .Include(m => m.Plano)
            .ToList();
    }

    public void Adicionar(MatriculaEntitie matricula)
    {
        _context.Matriculas.Add(matricula);


        _context.SaveChanges();
    }

    public void Atualizar(MatriculaEntitie matricula)
    {
        var matriculaExistente = BuscarPorId(matricula.Id);
        if (matriculaExistente != null)
        {
            matriculaExistente.AlunoId = matricula.AlunoId;
            matriculaExistente.PlanoId = matricula.PlanoId;
            _context.SaveChanges();
        }
    }

    public void Ativar(int id)
    {
        var matricula = _context.Matriculas.FirstOrDefault(m => m.Id == id);

        if (matricula == null)
            throw new Exception("Matrícula não encontrada");

        matricula.Ativa = true;
        matricula.Descricao = $"Matrícula ativada em {DateTime.Now:dd/MM/yyyy}";

        _context.SaveChanges();
    }

    public void Desativar(int id)
    {
        var matricula = _context.Matriculas.FirstOrDefault(m => m.Id == id);

        if (matricula == null)
            throw new Exception("Matrícula não encontrada");

        matricula.Ativa = false;
        matricula.Descricao = $"Matrícula desativada em {DateTime.Now:dd/MM/yyyy}";


        _context.SaveChanges();
    }

    public void Remover(int id)
    {
        var matricula = _context.Matriculas.FirstOrDefault(m => m.Id == id);

        if (matricula == null)
            throw new Exception("Matrícula não encontrada");

        _context.Matriculas.Remove(matricula);
        _context.SaveChanges();
    }
}
