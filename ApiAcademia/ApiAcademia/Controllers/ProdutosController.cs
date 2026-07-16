using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Principal.Controllers;

[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly IProdutosService _service;

    public ProdutosController(IProdutosService service)
    {
        _service = service;
    }

    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var produtos = _service.Listar();

        return Ok(produtos);
    }

    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var produto = _service.BuscarPorId(id);

        if (produto == null)
            return NotFound(new { messagem = "Produto não encontrado." });

        return Ok(produto);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("criar")]
    public IActionResult Criar([FromBody] CriarProdutoDTO dto)
    {
        _service.Criar(dto);

        return Ok("Produto criado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-produto/{id}")]
    public IActionResult Atualizar(int id, [FromBody] CriarProdutoDTO dto)
    {
        var atualizar = _service.Atualizar(id, dto);

        if (!atualizar)
            return NotFound(new { messagem = "Produto não encontrado." });

        return Ok("Produto atualizado com sucesso");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("deletar/{id}")]
    public IActionResult Remover(int id)
    {
        var removido = _service.Remover(id);

        if (!removido)
        {
            return NotFound(new
            {
                mensagem = "Plano não encontrado"
            });
        }

        return Ok(new
        {
            mensagem = "Plano removido com sucesso"
        });

    }
}