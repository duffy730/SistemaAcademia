using ApiAcademia.Business.DTOs.Criar;
using ApiAcademia.Business.DTOs.Response;
using ApiAcademia.Business.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiAcademia.Controllers;


[ApiController]
[Route("api/pagamentos")]
public class PagamentoController : ControllerBase
{
    private readonly IPagamentoService _service;

    public PagamentoController(IPagamentoService service)
    {
        _service = service;
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpGet("listar")]
    public IActionResult Listar()
    {
        var pagamentos = _service.listaPagamento();

        return Ok(pagamentos);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpGet("buscar-id/{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var pagamento = _service.BuscarPorId(id);

        if (pagamento == null)
            return NotFound(new { messagem = "Pagamento não encontrado." });

        return Ok(pagamento);
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPost("criar-pagamento")]
    public IActionResult Criar([FromBody] CriarPagamentoDTO dto)
    {
        _service.Criar(dto);

        return Ok("Pagamento criado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpPut("atualizar-pagamento/{id}")]
    public IActionResult Atualizar(int id, [FromBody] CriarPagamentoDTO dto)
    {
        var atualizar = _service.Atualizar(id, dto);

        if (!atualizar)
            return NotFound(new { messagem = "Pagamento não encontrado." });

        return Ok("Pagamento atualizado com sucesso");
    }

    [Authorize(Roles = "Admin, Recepcionista")]
    [HttpDelete("remover-pagamento/{id}")]
    public IActionResult Remover(int id)
    {
        var removido = _service.Remover(id);

        if(!removido)
        {
            return NotFound(new
            {
                mensagem = "Pagamento não encontrada"
            });
        }

        return Ok(new
        {
            mensagem = "Pagamento removido com sucesso"
        });
    }
}

