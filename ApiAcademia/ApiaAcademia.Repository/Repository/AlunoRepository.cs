using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IAlunoRepository
{
    List<AlunoEntitie> Listar();
    AlunoEntitie BuscarPorId(int Id);
    void Adicionar(AlunoEntitie aluno);
    void Atualizar(AlunoEntitie aluno);
    void Remover(int Id);
}
public class AlunoRepository : IAlunoRepository
{

    private readonly AppDbContext _context;

    public AlunoRepository(AppDbContext context)
    {
        _context = context;
    }

    public AlunoEntitie BuscarPorId(int id)
    {
        return _context.Alunos.FirstOrDefault(x => x.Id == id);
    }

    public List<AlunoEntitie> Listar()
    {
        return _context.Alunos.ToList();
    }

    public void Adicionar(AlunoEntitie aluno)
    {
        _context.Alunos.Add(aluno);
        _context.SaveChanges();
    }

    public void Atualizar(AlunoEntitie aluno)
    {
        var alunoExistente = BuscarPorId(aluno.Id);
        if (alunoExistente != null)
        {
            alunoExistente.Nome = aluno.Nome;
            alunoExistente.Peso = aluno.Peso;
            alunoExistente.Altura = aluno.Altura;
            alunoExistente.DataNascimento = aluno.DataNascimento;
            alunoExistente.Email = aluno.Email;
            alunoExistente.Telefone = aluno.Telefone;
            alunoExistente.Cpf = aluno.Cpf;
            _context.SaveChanges();
        }
    }

    public void Remover(int id)
    {
        var aluno = BuscarPorId(id);

        if (aluno != null)
        {
            _context.Alunos.Remove(aluno);

            _context.SaveChanges();
        }
    }
}
