using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IUserRepository
{
    UserEntitie BuscarPorEmail (string email);
    void Criar(UserEntitie user);
    UserEntitie BuscaPorEmail(string email);
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public UserEntitie BuscarPorEmail(string user)
    {
        return _context.Usuarios.FirstOrDefault(x => x.Usuario == user);
    }

    public void Criar(UserEntitie user)
    {
        _context.Usuarios.Add(user);
        _context.SaveChanges();
    }

    public UserEntitie BuscaPorEmail(string email)
    {
        return _context.Usuarios
            .FirstOrDefault(u => u.Usuario == email);
    }
}
