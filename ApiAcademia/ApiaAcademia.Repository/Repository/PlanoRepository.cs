using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApiAcademia.Repository.Repository;

public interface IPlanoRepository
{
    List<PlanoEntitie> Listar();
    PlanoEntitie? BuscarPorId(int id);
    void Adicionar(PlanoEntitie plano);
    void Atualizar(PlanoEntitie plano);
    void Remover(int id);
}

public class PlanoRepository : IPlanoRepository
{
    private readonly AppDbContext _context;

    public PlanoRepository(AppDbContext context)
    {
        _context = context;
    }

    public PlanoEntitie? BuscarPorId(int id)
    {
        return _context.Planos
            .FirstOrDefault(x => x.Id == id);
    }

    public List<PlanoEntitie> Listar()
    {
        return _context.Planos
            .AsNoTracking()
            .Select(plano => new PlanoEntitie
            {
                Id = plano.Id,
                Nome = plano.Nome,
                Valor = plano.Valor,
                DuracaoDias = plano.DuracaoDias,
                Descricao = plano.Descricao,

                MatriculasAtivas = _context.Matriculas.Count(
                    matricula =>
                        matricula.PlanoId == plano.Id &&
                        matricula.Ativa
                )
            })
            .ToList();
    }

    public void Adicionar(PlanoEntitie plano)
    {
        _context.Planos.Add(plano);
        _context.SaveChanges();
    }

    public void Atualizar(PlanoEntitie plano)
    {
        var planoExistente = BuscarPorId(plano.Id);

        if (planoExistente == null)
        {
            return;
        }

        planoExistente.Nome = plano.Nome;
        planoExistente.Valor = plano.Valor;
        planoExistente.Descricao = plano.Descricao;
        planoExistente.DuracaoDias = plano.DuracaoDias;

        _context.SaveChanges();
    }

    public void Remover(int id)
    {
        var plano = BuscarPorId(id);

        if (plano == null)
        {
            return;
        }

        _context.Planos.Remove(plano);
        _context.SaveChanges();
    }
}