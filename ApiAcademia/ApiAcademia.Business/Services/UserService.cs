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
using ApiAcademia.Business.DTOs.Atualizar;

namespace ApiAcademia.Business.Services;

public interface IUserService
{
    List<UserResponseDTO> listaUser();
    void Criar(CriarUserDTO dto);
    string Login(LoginDTO dto);
    UserEntitie BuscarPorEmail(string email);
    LoginDTO BuscarPorId(int id);
    bool Atualizar(int id, AtualizarUserDTO dto);
    bool Remover(int id);
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

    public LoginDTO BuscarPorId(int id)
    {
        var User = _userRepository.BuscarPorId(id);

        if (User == null)
        {
            return null;
        }

        return new LoginDTO
        {
            Usuario = User.Usuario,
            Senha = User.Senha
        };
    }

    public List<UserResponseDTO> listaUser()
    {
        var usuarios = _userRepository.Listar();

        return usuarios.Select(usuario => new UserResponseDTO
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Usuario = usuario.Usuario,
            Perfil = usuario.Role.ToString()
        })
        .ToList();
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
            return null;
        return GerarToken(usuario);
    }

    public bool Atualizar(int id, AtualizarUserDTO dto)
    {
        var usuarioExistente =
            _userRepository.BuscarPorId(id);

        if (usuarioExistente == null)
        {
            return false;
        }

        usuarioExistente.Nome =
            dto.Nome.Trim();

        /*
        * Email e usuário são o mesmo campo.
        */
        usuarioExistente.Usuario =
            dto.Email.Trim().ToLower();

        usuarioExistente.Role =
            dto.Role.ToString();

        /*
        * Quando dto.Senha for nula ou vazia,
        * mantém a senha que já está no banco.
        */
        if (!string.IsNullOrWhiteSpace(dto.Senha))
        {
            usuarioExistente.Senha =
                dto.Senha;
        }

        _userRepository.Atualizar(
            usuarioExistente
        );

        return true;
    }

    public bool Remover(int id)
    {
        var User = _userRepository.BuscarPorId(id);

        if (User == null)
            return false;

        _userRepository.Remover(id);
        return true;
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

    public UserEntitie BuscarPorEmail(string email)
    {
        var usuario = _userRepository.BuscarPorEmail(email);

        if (usuario == null)
            throw new Exception("Usuário não encontrado.");

        return usuario;
    }
}
