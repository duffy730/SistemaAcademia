using ApiAcademia.Repository.Data;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Migrations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Repository.Repository;

public interface IUserRepository
{
    List<UserEntitie> Listar();
    UserEntitie BuscarPorEmail (string email);
    UserEntitie BuscarPorId(int id);
    void Criar(UserEntitie user);
    void Atualizar(UserEntitie user);
    void Remover(int Id);
}

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public List<UserEntitie> Listar()
    {
        return _context.Usuarios.ToList();
    }

    public UserEntitie BuscarPorEmail(string user)
    {
        return _context.Usuarios.FirstOrDefault(x => x.Usuario == user);
    }

    public UserEntitie BuscarPorId(int id)
    {
        return _context.Usuarios.FirstOrDefault(x => x.Id == id);
    }

    public void Criar(UserEntitie user)
    {
        _context.Usuarios.Add(user);
        _context.SaveChanges();
    }

   public void Atualizar(UserEntitie user)
    {
        var userExistente = _context.Usuarios
            .FirstOrDefault(usuario => usuario.Id == user.Id);

        if (userExistente == null)
        {
            return;
        }

        userExistente.Nome = user.Nome;
        userExistente.Usuario = user.Usuario;
        userExistente.Role = user.Role;

        /*
        * Só altera a senha quando uma nova senha
        * realmente foi informada.
        */
        if (!string.IsNullOrWhiteSpace(user.Senha))
        {
            userExistente.Senha = user.Senha;
        }

        _context.SaveChanges();
    }

    public void Remover(int id)
    {
        var usuario = BuscarPorId(id);

        if (usuario != null)
        {
            _context.Usuarios.Remove(usuario);

            _context.SaveChanges();
        }
    }
}
