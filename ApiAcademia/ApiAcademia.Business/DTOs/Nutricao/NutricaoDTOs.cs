namespace ApiAcademia.Business.DTOs.Nutricao;

public class SalvarPlanoNutricaoDTO
{
    public int AlunoId { get; set; }

    public DateTime DataInicio { get; set; }

    public int CaloriasMeta { get; set; }

    public decimal ProteinasMeta { get; set; }

    public decimal CarboidratosMeta { get; set; }

    public decimal GordurasMeta { get; set; }

    public decimal AguaMetaLitros { get; set; }

    public string Observacoes { get; set; } = string.Empty;

    public List<SalvarRefeicaoNutricaoDTO> Refeicoes { get; set; } = new();

    public List<SalvarSuplementoNutricaoDTO> Suplementos { get; set; } = new();
}

public class SalvarRefeicaoNutricaoDTO
{
    public string Nome { get; set; } = string.Empty;

    public string Horario { get; set; } = string.Empty;

    public string Alimentos { get; set; } = string.Empty;

    public string Quantidades { get; set; } = string.Empty;

    public int Calorias { get; set; }

    public int Ordem { get; set; }
}

public class SalvarSuplementoNutricaoDTO
{
    public string Nome { get; set; } = string.Empty;

    public string Dosagem { get; set; } = string.Empty;
}

public class CriarMedidaCorporalDTO
{
    public DateTime Data { get; set; }

    public decimal Peso { get; set; }

    public decimal? Cintura { get; set; }

    public decimal? Braco { get; set; }

    public decimal? Peito { get; set; }
}

public class PlanoNutricaoResponseDTO
{
    public int Id { get; set; }

    public int AlunoId { get; set; }

    public string Aluno { get; set; } = string.Empty;

    public DateTime DataInicio { get; set; }

    public int CaloriasMeta { get; set; }

    public decimal ProteinasMeta { get; set; }

    public decimal CarboidratosMeta { get; set; }

    public decimal GordurasMeta { get; set; }

    public decimal AguaMetaLitros { get; set; }

    public string Observacoes { get; set; } = string.Empty;

    public bool Ativo { get; set; }

    public List<RefeicaoNutricaoResponseDTO> Refeicoes { get; set; } = new();

    public List<MedidaCorporalResponseDTO> Medidas { get; set; } = new();

    public List<SuplementoNutricaoResponseDTO> Suplementos { get; set; } = new();
}

public class RefeicaoNutricaoResponseDTO
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Horario { get; set; } = string.Empty;

    public string Alimentos { get; set; } = string.Empty;

    public string Quantidades { get; set; } = string.Empty;

    public int Calorias { get; set; }

    public int Ordem { get; set; }
}

public class MedidaCorporalResponseDTO
{
    public int Id { get; set; }

    public DateTime Data { get; set; }

    public decimal Peso { get; set; }

    public decimal? Cintura { get; set; }

    public decimal? Braco { get; set; }

    public decimal? Peito { get; set; }
}

public class SuplementoNutricaoResponseDTO
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Dosagem { get; set; } = string.Empty;
}
