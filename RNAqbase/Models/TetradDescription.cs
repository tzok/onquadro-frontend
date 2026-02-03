using System.Collections.Generic;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;


namespace RNAqbase.Models
{
    public class TetradDescription : BaseEntity
    {
        public int Id { get; set; }
        public string Public_id { get; set; }
        public string Basename { get; set; }
        public string QuadruplexId => TetradsInQuadruplex > 1 ? QuadruplexIdAsInt.ToString() : "99999999";
        public string Quadruplex_public_id { get; set; }
        public int PdbId { get; set; }
        public string PdbIdentifier { get; set; }
        public string Pdb_public_id { get; set; }
        public string Title { get; set; }
        public int AssemblyId { get; set; }
        public string Dot_bracket { get; set; }
        public string Molecule { get; set; }
        public string Sequence { get; set; }
        public string OnzClass { get; set; }
        public string Experiment { get; set; }
        public float Planarity { get; set; }
        public List<int> TetradsInTheSameQuadruplex { get; set; }
        public List<int> TetradsInTheSamePdb { get; set; }
        public string TetradCombination { get; set; }


        [JsonIgnore]
        public int QuadruplexIdAsInt { get; set; }

        [JsonIgnore]
        public int TetradsInQuadruplex { get; set; }

    }
}
