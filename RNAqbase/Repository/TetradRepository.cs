using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using RNAqbase.Models;

namespace RNAqbase.Repository
{
	public class TetradRepository : RepositoryBase, ITetradRepository
	{

		public TetradRepository(IConfiguration configuration) : base(configuration)
		{ }
		public async Task<TetradDescription> FindById(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();
				var result = await connection.QueryAsync<TetradDescription>
				(@"
					SELECT t.id, 
						t.public_id as ""Public_id"",
						t.basename as ""Basename"",
						t.quadruplex_id as ""QuadruplexIdAsInt"", 
						q.public_id as ""Quadruplex_public_id"",
						t.dot_bracket as ""Dot_bracket"",
						pdb1.identifier as ""PdbIdentifier"", 
						pdb1.public_id as ""Pdb_public_id"",
						pdb1.title as ""Title"",
						pdb1.id as ""PdbId"", 
						pdb1.experiment as ""Experiment"",
						COALESCE(pdb1.assembly, 0) as ""AssemblyId"",
						COALESCE(n1.molecule, 'Other') as ""Molecule"",
						COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), '') as ""Sequence"",
						CONCAT(n1.chain, n2.chain, n3.chain, n4.chain) as ""Strands"",
						t.onz as ""OnzClass"",
						t.planarity_deviation as ""Planarity"",
						(SELECT count(*) from tetrad tcount where tcount.quadruplex_id = t.quadruplex_id) as ""TetradsInQuadruplex"", 
						t.gba_tetrad_class as ""TetradCombination""
					FROM tetrad t
						JOIN quadruplex q on t.quadruplex_id = q.id
						JOIN nucleotide n1 on t.nt1_id = n1.id
						JOIN nucleotide n2 on t.nt2_id = n2.id
						JOIN nucleotide n3 on t.nt3_id = n3.id
						JOIN nucleotide n4 on t.nt4_id = n4.id
						JOIN pdb pdb1 on n1.pdb_id = pdb1.id
					WHERE t.id = @Id;", new { Id = id });
				return result.FirstOrDefault();
			}
		}

		public async Task<IEnumerable<TetradTable>> FindAll()
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<TetradTable>
				(@"
					SELECT max(t.id) as id, 
					max(t.public_id) as Public_id,
	t.quadruplex_id as QuadruplexId, 
	max(q.public_id) as Quadruplex_public_id,
	max(pdb1.identifier) as PdbId, 
	max(pdb1.public_id) as Pdb_public_id,
	to_char(max(pdb1.release_date)::date, 'YYYY-MM-DD') as PdbDeposition,
	COALESCE(max(pdb1.assembly), 0) as AssemblyId,
	COALESCE(max(n1.molecule), 'Other') as Molecule,
	COALESCE(max(pdb1.experiment)) as Experiment,
	COALESCE((max(n1.short_name))||(max(n2.short_name))||(max(n3.short_name))||(max(n4.short_name)), '') as Sequence,
	t.onz as OnzClass, 
	t.gba_tetrad_class as TetradCombination,
	string_agg(DISTINCT(i.name)::text, ', ') as Ion,
	string_agg(DISTINCT(i.charge)::text, ', ') as Ion_charge
	FROM tetrad t
	JOIN quadruplex q on t.quadruplex_id = q.id
	JOIN nucleotide n1 on t.nt1_id = n1.id
	JOIN nucleotide n2 on t.nt2_id = n2.id
	JOIN nucleotide n3 on t.nt3_id = n3.id
	JOIN nucleotide n4 on t.nt4_id = n4.id
	JOIN pdb pdb1 on n1.pdb_id = pdb1.id
	left JOIN ion_channel ic on t.id = ic.tetrad_id
	left JOIN ion i on i.id = ic.ion_id
	group by t.id
	ORDER BY t.id");
			}
		}

		public async Task<IEnumerable<int>> GetOtherTetradsInTheSameQuadruplex(int tetradId, int quadruplexId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<int>
				(@"
					SELECT id
					FROM tetrad
					WHERE quadruplex_id = @QuadruplexId 
						AND id <> @TetradId;", new { QuadruplexId = quadruplexId, TetradId = tetradId });
			}
		}

		public async Task<TetradNucleotides> GetTetradNucleotides(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();
				var result = await connection.QueryAsync<TetradNucleotides>
				(@"
					SELECT 
					n1.full_name as n1_full_name, 
					n1.short_name as n1_short_name,
					n1.chi as n1_chi, 
					n1.glycosidic_bond as n1_glycosidic_bond,
					n2.full_name as n2_full_name, 
					n2.short_name as n2_short_name,
					n2.chi as n2_chi, 
					n2.glycosidic_bond as n2_glycosidic_bond,
					n3.full_name as n3_full_name, 
					n3.short_name as n3_short_name,
					n3.chi as n3_chi, 
					n3.glycosidic_bond as n3_glycosidic_bond,
					n4.full_name as n4_full_name, 
					n4.short_name as n4_short_name,
					n4.chi as n4_chi, 
					n4.glycosidic_bond as n4_glycosidic_bond
					FROM tetrad t
					JOIN nucleotide n1 on t.nt1_id = n1.id
					JOIN nucleotide n2 on t.nt2_id = n2.id
					JOIN nucleotide n3 on t.nt3_id = n3.id
					JOIN nucleotide n4 on t.nt4_id = n4.id
					WHERE t.id =  @Id;", new { Id = id });
				return result.FirstOrDefault();
			}
		}

		public async Task<IEnumerable<int>> GetOtherTetradsInTheSamePdb(int tetradId, int pdbId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<int>
				(@"
					SELECT t.id
					FROM tetrad t
						JOIN nucleotide n1 on t.nt1_id = n1.id
					WHERE n1.pdb_id = @PdbId 
						AND t.id <> @TetradId;", new { PdbId = pdbId, TetradId = tetradId });
			}
		}

		public async Task<IEnumerable<TetradReference>> FindAllTetradsInTheSameQuadruplex(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<TetradReference>
				(@"
	                SELECT t.id, 
						t.public_id as ""Public_id"",
						q.public_id as ""Quadruplex_public_id"",
		                COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), '') as ""Sequence"",
		                t.onz as ""OnzClass"",
		                t.planarity_deviation as ""Planarity"",
		                tp.rise,
		                tp.twist,
		                tp.tetrad2_id, 
		                tp.direction
	                FROM tetrad t
						JOIN quadruplex q on t.quadruplex_id = q.id
		                JOIN nucleotide n1 on t.nt1_id = n1.id
		                JOIN nucleotide n2 on t.nt2_id = n2.id
		                JOIN nucleotide n3 on t.nt3_id = n3.id
		                JOIN nucleotide n4 on t.nt4_id = n4.id
		                LEFT JOIN tetrad_pair tp on t.id = tp.tetrad1_id
	                WHERE t.quadruplex_id = @QuadruplexId
	                ORDER BY t.id;", new { QuadruplexId = id });
			}
		}

		public async Task<IEnumerable<TetradReference>> FindAllTetradsInTheSameHelix(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<TetradReference>
				(@"
	                SELECT t.id, 
						t.public_id as ""Public_id"",
						q.public_id as ""Quadruplex_public_id"",
		                COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), '') as ""Sequence"",
		                t.onz as ""OnzClass"",
		                t.planarity_deviation as ""Planarity"",
		                tp.rise,
		                tp.twist,
		                tp.tetrad2_id, 
		                tp.direction,
						t.quadruplex_id as ""Quadruplex_id"",
                		t2.quadruplex_id as ""Quadruplex_pair_id""
					FROM tetrad t
						JOIN quadruplex q on t.quadruplex_id = q.id
						JOIN nucleotide n1 on t.nt1_id = n1.id
						JOIN nucleotide n2 on t.nt2_id = n2.id
						JOIN nucleotide n3 on t.nt3_id = n3.id
						JOIN nucleotide n4 on t.nt4_id = n4.id
						LEFT JOIN tetrad_pair tp on t.id = tp.tetrad1_id
                		LEFT JOIN tetrad t2 on t2.id = tp.tetrad2_id
					WHERE t.quadruplex_id IN (select quadruplex_id from helix_quadruplex where helix_id = @HelixId)
					ORDER BY  t.id;", new { HelixId = id });
			}
		}

		public async Task<IEnumerable<TetradSummary>> GetTetradSummariesByPdbId(int pdbId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<TetradSummary>
				(@"
					SELECT
						t.id AS Id,
						t.public_id AS Public_id,
						t.quadruplex_id AS Quadruplex_id
					FROM tetrad t
						JOIN nucleotide n1 on t.nt1_id = n1.id
					WHERE n1.pdb_id = @PdbId
					ORDER BY t.quadruplex_id, t.id;",
					new { PdbId = pdbId });
			}
		}

		public async Task<MemoryStream> GetTetrad3dVisualization(int tetradId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				var coordinates = await connection.QueryFirstAsync<string>
				(@"
					SELECT coordinates
					FROM tetrad
					WHERE id = @Id;", new { Id = tetradId });

				var stream = new MemoryStream();
				var writer = new StreamWriter(stream);
				writer.Write(coordinates);
				writer.Flush();
				stream.Position = 0;
				return stream;
			}
		}


		public async Task<IEnumerable<Ions_tetrad>> GetIons(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<Ions_tetrad>(
					@"
						SELECT 
	ion.name as Ion,
	ion.charge as Ion_charge,
	nucleotide.short_name as Symbol,
	nucleotide.full_name as Full_name
	FROM tetrad t
	JOIN quadruplex q on t.quadruplex_id = q.id
	JOIN nucleotide n1 on t.nt1_id = n1.id
	JOIN pdb pdb1 on n1.pdb_id = pdb1.id
	left JOIN ion_channel ic on t.id = ic.tetrad_id
	left JOIN ion on ion.id = ic.ion_id
	left JOIN ion_outside on ion.id = ion_outside.ion_id
	left JOIN nucleotide on ion_outside.nucleotide_id = nucleotide.id
	where t.id = @id
	group by ion.name, ion.charge, nucleotide.short_name, nucleotide.full_name

						", new { id = id });
			}
		}
	}
}
