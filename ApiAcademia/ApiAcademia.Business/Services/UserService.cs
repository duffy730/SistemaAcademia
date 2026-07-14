using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Repository.Entities;
using ApiAcademia.Repository.Migrations;
using ApiAcademia.Repository.Repository;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ApiAcademia.Business.Services;

public interface IUserService
{
    void Criar(CriarUserDTO dto);
    string Login(LoginDTO dto);
    UserEntitie BuscaPorEmail(string email);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public UserService(
        IUserRepository usuarioRepository,
        IConfiguration configuration)
    {
        _userRepository = usuarioRepository;
        _configuration = configuration;
    }

    public void Criar(CriarUserDTO dto)
    {
        if (_userRepository.BuscarPorEmail(dto.Usuario) != null)
            throw new Exception("Usuário já existe");

        if (!Enum.IsDefined(typeof(Roles), dto.Role))
            throw new Exception("Role inválida.");

        var usuario = new UserEntitie
        {
            Nome = dto.Nome,
            Usuario = dto.Usuario,
            Senha = dto.Senha,
            Role = dto.Role.ToString()
        };
        _userRepository.Criar(usuario);
    }

    public string Login(LoginDTO dto)
    {
        var usuario = _userRepository.BuscarPorEmail(dto.Usuario);

        if (usuario == null || usuario.Senha != dto.Senha)
            throw new Exception("Usuário ou senha inválidos");
        return GerarToken(usuario);
    }

    private string ObterRole(int role)
    {
        switch (role)
        {
            case 1:
                return "User";

            case 2:
                return "Admin";

            case 3:
                return "Recepcionista";

            case 4:
                return "Nutri";

            default:
                throw new Exception("Role inválida.");
        }
    }

    private string GerarToken(UserEntitie usuario)
    {

    var claims = new[]
       {
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Usuario),
            new Claim(ClaimTypes.Role, usuario.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

        var credenciais = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: credenciais);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public UserEntitie BuscaPorEmail(string email)
    {
        var usuario = _userRepository.BuscaPorEmail(email);

        if (usuario == null)
            throw new Exception("Usuário não encontrado.");

        return usuario;
    }
}
