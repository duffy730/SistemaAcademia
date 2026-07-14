using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using System.Numerics;

namespace ApiAcademia.Repository.Repository;

public interface IPlanoRepository
{
    List<PlanoEntitie> Listar();
    PlanoEntitie BuscarPorId(int id);
    void Adicionar(PlanoEntitie plano);
    void Remover(int id);
}

public class PlanoRepository : IPlanoRepository
{
    private readonly AppDbContext _context;

    public PlanoRepository(AppDbContext context)
    {
        _context = context;
    }

    public PlanoEntitie BuscarPorId(int id)
    {
        return _context.Planos.FirstOrDefault(x => x.Id == id);
    }

    public List<PlanoEntitie> Listar()
    {

        return _context.Planos.ToList();
    }

    public void Adicionar(PlanoEntitie plano)
    {
        _context.Planos.Add(plano);

        _context.SaveChanges();
    }

    public void Remover(int id)
    {
        var plano = BuscarPorId(id);

        if (plano != null)
        {
            _context.Planos.Remove(plano);
            _context.SaveChanges();
        }
    }
}